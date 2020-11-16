import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transaction = await transactionsRepository.findOne(id);

    if (!transaction) {
      throw new AppError('Transaction does not exist');
    }

    const balance = await transactionsRepository.getBalance();

    const deleteTransactionTurnsBalanceNegative =
      balance.total - transaction.value < 0;

    if (deleteTransactionTurnsBalanceNegative) {
      throw new AppError(
        'Delete this transaction will turn your balance negative.',
      );
    }

    await transactionsRepository.delete(id);
  }
}

export default DeleteTransactionService;
