/// Simulated Demonstration Payment Methods for GLOROV Frontend
enum GlorovPaymentMethod {
  cod,
  upi,
  card;

  String get title {
    switch (this) {
      case GlorovPaymentMethod.cod:
        return 'Cash on Delivery (COD)';
      case GlorovPaymentMethod.upi:
        return 'UPI Instant Transfer';
      case GlorovPaymentMethod.card:
        return 'Credit / Debit Card (Simulated)';
    }
  }

  String get subtitle {
    switch (this) {
      case GlorovPaymentMethod.cod:
        return 'Pay safely upon doorstep delivery via cash or courier UPI QR code.';
      case GlorovPaymentMethod.upi:
        return 'Pay seamlessly via Google Pay, PhonePe, Paytm, or BHIM.';
      case GlorovPaymentMethod.card:
        return 'Demonstration card preview (Visa, MasterCard, RuPay).';
    }
  }
}
