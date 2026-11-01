import '../../models/glorov/glorov_faq.dart';
import '../../services/glorov_account_state.dart';
import '../contracts/support_repository.dart';

/// Local Storage / In-Memory implementation of SupportRepository
class LocalSupportRepository implements SupportRepository {
  final GlorovAccountState _accountState;

  LocalSupportRepository([GlorovAccountState? accountState])
      : _accountState = accountState ?? GlorovAccountState.instance;

  @override
  Future<List<GlorovFaqItem>> getFaqs({String? category}) async {
    return GlorovFaqRepository.search('', category: category);
  }

  @override
  Future<String> submitInquiry(SupportTicketSubmission inquiry) async {
    return _accountState.submitSupportTicket(
      name: inquiry.name,
      email: inquiry.email,
      topic: inquiry.topic,
      orderReference: inquiry.orderReference,
      message: inquiry.message,
    );
  }
}
