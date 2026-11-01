import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';

/// GLOROV Y-Scroll Pass-Through Boundary
///
/// Fixes Flutter Web / desktop / trackpad issue where horizontal carousels, sliders,
/// chip rows, and horizontal scrollables intercept vertical mouse wheel and trackpad
/// gestures (Y-scroll), causing the carousel to scroll horizontally or the page to freeze.
///
/// How it works:
/// When a [PointerScrollEvent] is hit-tested over this widget, if the gesture is
/// predominantly or purely vertical (|dy| >= |dx| and dy != 0):
/// 1. Registers with [GestureBinding.instance.pointerSignalResolver] BEFORE the
///    horizontal scrollable's internal listener can consume it.
/// 2. Dispatches [PointerScrollEvent.scrollDelta.dy] directly to the nearest
///    ancestor vertical [Scrollable] (e.g., the page's SingleChildScrollView, ListView)
///    or the explicitly provided [parentScrollController].
/// 3. If the gesture is horizontal (|dx| > |dy| or Shift+wheel), this widget does NOT
///    register, allowing the horizontal carousel/slider to scroll naturally.
class GlorovYScrollPassThrough extends StatelessWidget {
  final Widget child;
  final ScrollController? parentScrollController;

  const GlorovYScrollPassThrough({
    super.key,
    required this.child,
    this.parentScrollController,
  });

  /// Finds the nearest ancestor Scrollable whose axis is Axis.vertical
  static ScrollableState? findVerticalScrollable(BuildContext context) {
    ScrollableState? found;
    context.visitAncestorElements((element) {
      if (element is StatefulElement && element.state is ScrollableState) {
        final state = element.state as ScrollableState;
        if (state.widget.axis == Axis.vertical) {
          found = state;
          return false; // Stop searching once nearest vertical scrollable is found
        }
      }
      return true;
    });
    return found;
  }

  @override
  Widget build(BuildContext context) {
    return Listener(
      behavior: HitTestBehavior.translucent,
      onPointerSignal: (pointerSignal) {
        if (pointerSignal is PointerScrollEvent) {
          final dy = pointerSignal.scrollDelta.dy;
          final dx = pointerSignal.scrollDelta.dx;

          if (dy != 0.0 && dy.abs() >= dx.abs()) {
            // Predominantly vertical gesture (mouse wheel or trackpad Y-scroll)
            GestureBinding.instance.pointerSignalResolver.register(pointerSignal, (event) {
              if (event is! PointerScrollEvent) return;
              final target = findVerticalScrollable(context);
              if (target != null && target.position.hasPixels) {
                target.position.pointerScroll(event.scrollDelta.dy);
              } else if (parentScrollController != null && parentScrollController!.hasClients) {
                parentScrollController!.position.pointerScroll(event.scrollDelta.dy);
              }
            });
          }
        }
      },
      child: child,
    );
  }
}
