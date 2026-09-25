'use client';
import { useState, useCallback } from 'react';

const AUTO_DOWNLOAD_LIMIT_MB = 40;
const CACHE_NAME = 'academic-files-v1';

export function useDownloadManager() {
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadFile = useCallback(async (fileId: string, title: string, sizeInBytes: number, force: boolean = false) => {
        const sizeInMB = sizeInBytes / (1024 * 1024);
        const url = `/api/download/${fileId}?title=${encodeURIComponent(title)}`;

        if (!force && sizeInMB > AUTO_DOWNLOAD_LIMIT_MB) {
            const confirm = window.confirm(
                `Large File Warning: This file is ${sizeInMB.toFixed(1)}MB. Would you like to download it now?`
            );
            if (!confirm) return false;
        }

            try {
                setIsDownloading(true);
                const response = await fetch(url);
                
                if (!response.ok) throw new Error('Download failed');

                const contentDisposition = response.headers.get('Content-Disposition');
                let filename = title;

                // Try to extract filename from Content-Disposition (handles RFC 5987)
                if (contentDisposition) {
                    const filenameStarMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
                    const filenameMatch = contentDisposition.match(/filename="([^"]+)"/i);
                    
                    if (filenameStarMatch) {
                        filename = decodeURIComponent(filenameStarMatch[1]);
                    } else if (filenameMatch) {
                        filename = filenameMatch[1];
                    }
                }

                const blob = await response.blob();
                const contentType = response.headers.get('Content-Type') || 'application/octet-stream';

                // Final safety: if filename still has no extension but we know the type
                if (!filename.includes('.')) {
                    if (contentType === 'application/pdf') filename += '.pdf';
                    else if (contentType === 'image/png') filename += '.png';
                    else if (contentType === 'image/jpeg') filename += '.jpg';
                    else if (contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') filename += '.docx';
                }

                const downloadUrl = window.URL.createObjectURL(blob);
                
                // Cache it for future offline use
                const cache = await caches.open(CACHE_NAME);
                await cache.put(url, new Response(blob, {
                    headers: {
                        'Content-Type': contentType,
                        'Content-Length': blob.size.toString()
                    }
                }));

                // Trigger the browser download dialog
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(downloadUrl);
                a.remove();
                
                return true;
            } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download file. Please try again.');
            return false;
        } finally {
            setIsDownloading(false);
        }
    }, []);

    const prefetchFile = useCallback(async (fileId: string, title: string, sizeInBytes: number) => {
        // Check if background sync is enabled by user
        const syncEnabled = localStorage.getItem('background_sync_enabled') !== 'false';
        if (!syncEnabled) return;

        const sizeInMB = sizeInBytes / (1024 * 1024);
        if (sizeInMB > AUTO_DOWNLOAD_LIMIT_MB) return;

        const url = `/api/download/${fileId}?title=${encodeURIComponent(title)}`;
        const cache = await caches.open(CACHE_NAME);
        const exists = await cache.match(url);

        if (!exists) {
            try {
                // Fetch in background and put in cache
                const response = await fetch(url);
                if (response.ok) {
                    const blob = await response.blob();
                    const contentType = title.toLowerCase().endsWith('.pdf') 
                        ? 'application/pdf' 
                        : (response.headers.get('Content-Type') || 'application/octet-stream');
                    
                    // Re-package into a fresh response with headers preserved
                    await cache.put(url, new Response(blob, {
                        headers: {
                            'Content-Type': contentType,
                            'Content-Length': blob.size.toString()
                        }
                    }));
                    console.log(`[Success] Offline ready: ${title} (${contentType})`);
                }
            } catch (e) {
                console.warn('Silent prefetch failed:', e);
            }
        }
    }, []);

    const getCachedFile = useCallback(async (fileId: string, title: string) => {
        try {
            const url = `/api/download/${fileId}?title=${encodeURIComponent(title)}`;
            const cache = await caches.open(CACHE_NAME);
            const response = await cache.match(url);
            
            if (response) {
                const blob = await response.blob();
                const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
                
                return {
                    url: URL.createObjectURL(blob),
                    type: contentType
                };
            }
        } catch (e) {
            console.error('Error getting cached file:', e);
        }
        return null;
    }, []);

    const isFileCached = useCallback(async (fileId: string, title: string) => {
        try {
            const url = `/api/download/${fileId}?title=${encodeURIComponent(title)}`;
            const cache = await caches.open(CACHE_NAME);
            const response = await cache.match(url);
            return !!response;
        } catch (e) {
            return false;
        }
    }, []);

    return { downloadFile, prefetchFile, getCachedFile, isFileCached, isDownloading };
}
