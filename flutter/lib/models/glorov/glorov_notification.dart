/// Notification Model for GLOROV Customer Center
enum GlorovNotificationCategory {
  order,
  gardeningTip,
  wishlist,
  announcement,
}

extension GlorovNotificationCategoryExt on GlorovNotificationCategory {
  String get label {
    switch (this) {
      case GlorovNotificationCategory.order:
        return 'Orders';
      case GlorovNotificationCategory.gardeningTip:
        return 'Gardening Tips';
      case GlorovNotificationCategory.wishlist:
        return 'Wishlist';
      case GlorovNotificationCategory.announcement:
        return 'Store News';
    }
  }
}

class GlorovNotification {
  final String id;
  final String title;
  final String message;
  final DateTime timestamp;
  final GlorovNotificationCategory category;
  final bool isRead;
  final String? routeDestination;

  const GlorovNotification({
    required this.id,
    required this.title,
    required this.message,
    required this.timestamp,
    required this.category,
    this.isRead = false,
    this.routeDestination,
  });

  String get timeAgo {
    final diff = DateTime.now().difference(timestamp);
    if (diff.inMinutes < 60) {
      return '${diff.inMinutes <= 1 ? 1 : diff.inMinutes}m ago';
    } else if (diff.inHours < 24) {
      return '${diff.inHours}h ago';
    } else if (diff.inDays < 7) {
      return '${diff.inDays}d ago';
    } else {
      return '${timestamp.day}/${timestamp.month}/${timestamp.year}';
    }
  }

  GlorovNotification copyWith({
    String? id,
    String? title,
    String? message,
    DateTime? timestamp,
    GlorovNotificationCategory? category,
    bool? isRead,
    String? routeDestination,
  }) {
    return GlorovNotification(
      id: id ?? this.id,
      title: title ?? this.title,
      message: message ?? this.message,
      timestamp: timestamp ?? this.timestamp,
      category: category ?? this.category,
      isRead: isRead ?? this.isRead,
      routeDestination: routeDestination ?? this.routeDestination,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'message': message,
        'timestamp': timestamp.toIso8601String(),
        'category': category.name,
        'isRead': isRead,
        'routeDestination': routeDestination,
      };

  factory GlorovNotification.fromJson(Map<String, dynamic> json) {
    return GlorovNotification(
      id: json['id'] as String? ??
          'notif_${DateTime.now().millisecondsSinceEpoch}',
      title: json['title'] as String? ?? '',
      message: json['message'] as String? ?? '',
      timestamp: json['timestamp'] != null
          ? DateTime.tryParse(json['timestamp'] as String) ?? DateTime.now()
          : DateTime.now(),
      category: GlorovNotificationCategory.values.firstWhere(
        (c) => c.name == (json['category'] as String? ?? 'order'),
        orElse: () => GlorovNotificationCategory.order,
      ),
      isRead: json['isRead'] as bool? ?? false,
      routeDestination: json['routeDestination'] as String?,
    );
  }

  /// Initial realistic mock notifications
  static List<GlorovNotification> get sampleNotifications {
    final now = DateTime.now();
    return [
      GlorovNotification(
        id: 'notif_01',
        title: 'Heirloom Seeds Dispatched',
        message:
            'Order #GLR-ORD-2026-8812 has completed nursery quality verification and is out for delivery with Botanical Transit Shield.',
        timestamp: now.subtract(const Duration(hours: 2)),
        category: GlorovNotificationCategory.order,
        isRead: false,
        routeDestination: 'orders',
      ),
      GlorovNotification(
        id: 'notif_02',
        title: 'Monsoon Sowing Window Alert',
        message:
            'Optimal time to sow Bhut Jolokia Chilli & Marigold seeds in South & West India for maximum flowering yield.',
        timestamp: now.subtract(const Duration(hours: 5)),
        category: GlorovNotificationCategory.gardeningTip,
        isRead: false,
        routeDestination: 'discover',
      ),
      GlorovNotification(
        id: 'notif_03',
        title: 'Wishlist Item Restocked',
        message:
            'Swiss Cheese Plant (Monstera Deliciosa) with 8-inch terracotta planter is back in stock at the botanical nursery.',
        timestamp: now.subtract(const Duration(days: 1)),
        category: GlorovNotificationCategory.wishlist,
        isRead: false,
        routeDestination: 'bookmark',
      ),
      GlorovNotification(
        id: 'notif_04',
        title: 'Demonstration Order Delivered',
        message:
            'Botanical air courier confirmed delivery of your live Snake Plant Laurentii. Please inspect root hydration within 48 hours.',
        timestamp: now.subtract(const Duration(days: 2)),
        category: GlorovNotificationCategory.order,
        isRead: true,
        routeDestination: 'orders',
      ),
      GlorovNotification(
        id: 'notif_05',
        title: 'Welcome to GLOROV',
        message:
            'Enjoy ₹100 off your first organic heirloom order with code GLOROV10 at checkout. Free shipping on orders over ₹999.',
        timestamp: now.subtract(const Duration(days: 4)),
        category: GlorovNotificationCategory.announcement,
        isRead: true,
        routeDestination: 'discover',
      ),
    ];
  }
}
