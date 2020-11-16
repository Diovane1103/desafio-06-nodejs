import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';
import TransactionRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    category,
    value,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionRepository);

    const balance = await transactionsRepository.getBalance();

    const totalIsEnough = !(type === 'outcome' && balance.total < value);

    if (!totalIsEnough) {
      throw new AppError(
        'The amount in account is not enough to this outcome value',
      );
    }

    const categoriesRepository = getRepository(Category);

    let categoryIsCreated = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!categoryIsCreated) {
      categoryIsCreated = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(categoryIsCreated);
    }

    const transaction = transactionsRepository.create({
      title,
      category_id: categoryIsCreated.id,
      value,
      type,
    });

    await transactionsRepository.save(transaction);

    return {
      ...transaction,
      category: categoryIsCreated,
    };
  }
}

export default CreateTransactionService;
