import '../../models/glorov/glorov_faq.dart';

/// Support Ticket Submission DTO
class SupportTicketSubmission {
  final String name;
  final String email;
  final String topic;
  final String? orderReference;
  final String message;

  const SupportTicketSubmission({
    required this.name,
    required this.email,
    required this.topic,
    this.orderReference,
    required this.message,
  });
}

/// Abstract Customer Support & FAQs Repository Contract
abstract class SupportRepository {
  Future<List<GlorovFaqItem>> getFaqs({String? category});
  Future<String> submitInquiry(SupportTicketSubmission inquiry);
}
