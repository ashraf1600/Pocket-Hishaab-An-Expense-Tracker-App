const TransactionList = ({ transactions, loading, onDelete }) => {
  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!transactions.length) return (
    <div className="bg-white p-8 rounded-lg shadow-md text-center">
      <p className="text-gray-500">No transactions found</p>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="w-full min-w-max">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {transactions.map((txn) => (
            <tr key={txn.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm">{txn.date}</td>
              <td className="px-4 py-3 text-sm">{txn.description || '-'}</td>
              <td className="px-4 py-3 text-sm">{txn.category?.name || '-'}</td>
              <td className="px-4 py-3 text-sm">{txn.account?.name || '-'}</td>
              <td className={`px-4 py-3 text-sm font-semibold ${txn.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {txn.type === 'income' ? '+' : '-'}${txn.amount.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-sm">
                <button onClick={() => onDelete(txn.id)} className="text-red-600 hover:text-red-800">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default TransactionList;