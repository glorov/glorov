/// Simulated Delivery Transit Options for GLOROV
enum GlorovDeliveryOption {
  standard,
  express;

  String get title {
    switch (this) {
      case GlorovDeliveryOption.standard:
        return 'Standard Safe Eco Transit';
      case GlorovDeliveryOption.express:
        return 'Express Priority Botanical Air Courier';
    }
  }

  String get estimatedDays {
    switch (this) {
      case GlorovDeliveryOption.standard:
        return '4 - 6 business days';
      case GlorovDeliveryOption.express:
        return '24 - 48 hours dispatch (Air Freight)';
    }
  }

  String get subtitle {
    switch (this) {
      case GlorovDeliveryOption.standard:
        return 'Delivered in $estimatedDays with ventilated plant transit insurance.';
      case GlorovDeliveryOption.express:
        return 'Guaranteed $estimatedDays via dedicated temperature-controlled air courier.';
    }
  }

  double calculateCost(double subtotal) {
    switch (this) {
      case GlorovDeliveryOption.standard:
        return subtotal >= 999.0 ? 0.0 : 99.0;
      case GlorovDeliveryOption.express:
        return 149.0;
    }
  }
}
