import { EntityRepository, Repository, getCustomRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transactions = await transactionsRepository.find();

    const income = transactions
      .filter(transaction => transaction.type === 'income')
      .reduce((total: number, { value }) => {
        return total + value;
      }, 0);

    const outcome = transactions
      .filter(transaction => transaction.type === 'outcome')
      .reduce((total: number, { value }) => {
        return total + value;
      }, 0);

    const balance = { income, outcome, total: income - outcome };

    return balance;
  }

  public async filteredTransactions(): Promise<Transaction[]> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transactions = await transactionsRepository
      .createQueryBuilder('transactions')
      .leftJoin('transactions.category', 'category')
      .select([
        'transactions.id',
        'transactions.title',
        'transactions.type',
        'transactions.value',
      ])
      .addSelect('category.id')
      .addSelect('category.title')
      .getMany();

    return transactions;
  }
}

export default TransactionsRepository;
