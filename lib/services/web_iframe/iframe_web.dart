// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;
import 'dart:ui_web' as ui_web;
import 'package:flutter/material.dart';

int _viewIdCounter = 0;

Widget getWebIframeWidget(String url, {String? srcdoc}) {
  final String viewType = 'vulms-live-iframe-${++_viewIdCounter}';
  ui_web.platformViewRegistry.registerViewFactory(
    viewType,
    (int viewId) {
      final element = html.IFrameElement()
        ..style.border = 'none'
        ..style.width = '100%'
        ..style.height = '100%'
        ..allow = 'fullscreen';
      if (srcdoc != null && srcdoc.isNotEmpty) {
        element.srcdoc = srcdoc;
      } else {
        element.src = url;
      }
      return element;
    },
  );
  return HtmlElementView(viewType: viewType, key: ValueKey(viewType));
}
