/**
 * A simple scoring-based fuzzy search utility.
 * Finds matches where characters in the query appear in the target string in order.
 * Higher scores for consecutive matches and matches at the start of words.
 */
export function fuzzySearch<T>(list: T[], query: string, keys: (keyof T)[]): T[] {
    if (!query) return list;
    
    const lowerQuery = query.toLowerCase().replace(/\s+/g, '');
    const results = list.map(item => {
        let maxScore = -1;
        
        for (const key of keys) {
            const target = String(item[key] || '').toLowerCase();
            const score = calculateScore(target, lowerQuery);
            if (score > maxScore) maxScore = score;
        }
        
        return { item, score: maxScore };
    });
    
    // Filter out non-matches and sort by score
    return results
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(r => r.item);
}

function calculateScore(target: string, query: string): number {
    if (target.includes(query)) return 100 + (target.startsWith(query) ? 50 : 0);
    
    let score = 0;
    let queryIdx = 0;
    let targetIdx = 0;
    let consecutiveMatches = 0;
    
    // Check if query is a subsequence of target
    while (queryIdx < query.length && targetIdx < target.length) {
        if (query[queryIdx] === target[targetIdx]) {
            score += 1;
            // Bonus for consecutive characters
            if (consecutiveMatches > 0) score += consecutiveMatches * 2;
            
            // Bonus for matches at the beginning of words/segments
            if (targetIdx === 0 || target[targetIdx - 1] === ' ' || !/[a-zA-Z0-9]/.test(target[targetIdx - 1])) {
                score += 10;
            }
            
            queryIdx++;
            consecutiveMatches++;
        } else {
            consecutiveMatches = 0;
        }
        targetIdx++;
    }
    
    // If we didn't find all query characters in order, it's not a match
    if (queryIdx < query.length) return 0;
    
    // Penalize long gaps/targets
    return score - (target.length * 0.1);
}
