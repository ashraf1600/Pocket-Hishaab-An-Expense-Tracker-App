import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Container, Row, Col, Card, Table, Button, Form,
  Spinner, Badge
} from 'react-bootstrap';
import {
  FaPlus, FaTrash, FaFilter, FaTimes,
  FaCalendarAlt, FaWallet, FaArrowUp,
  FaArrowDown, FaBalanceScale, FaSync
} from 'react-icons/fa';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Transactions = () => {
  const location = useLocation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', start_date: '', end_date: '' });

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      const res = await api.get(`/transactions/?${params.toString()}`);
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Refetch when filters change or route changes
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, location.key]);

  // Also refetch when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchTransactions();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchTransactions]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      toast.success('Deleted!');
      fetchTransactions();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const clearFilters = () => {
    setFilters({ type: '', start_date: '', end_date: '' });
  };

  const totalCount = transactions.length;
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold mb-0 d-flex align-items-center">
            <FaWallet className="me-2 text-primary" /> Transactions
          </h1>
          <p className="text-muted mb-0">
            {totalCount} transactions · {transactions.filter(t => t.type === 'income').length} income · {transactions.filter(t => t.type === 'expense').length} expenses
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={fetchTransactions} className="rounded-pill">
            <FaSync className="me-1" /> Refresh
          </Button>
          <Link to="/add-transaction">
            <Button variant="primary" className="rounded-pill px-4">
              <FaPlus className="me-2" /> Add Transaction
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <Row className="mb-4 g-3">
        <Col md={4}>
          <Card className="text-white border-0 card-hover" style={{ background: 'linear-gradient(135deg, #11998e, #38ef7d)' }}>
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <Card.Text className="opacity-75" style={{ fontSize: '0.9rem' }}>Total Income</Card.Text>
                <h3 className="fw-bold mb-0">${totalIncome.toFixed(2)}</h3>
              </div>
              <FaArrowUp size={36} className="opacity-75" />
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-white border-0 card-hover" style={{ background: 'linear-gradient(135deg, #eb3349, #f45c43)' }}>
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <Card.Text className="opacity-75" style={{ fontSize: '0.9rem' }}>Total Expenses</Card.Text>
                <h3 className="fw-bold mb-0">${totalExpense.toFixed(2)}</h3>
              </div>
              <FaArrowDown size={36} className="opacity-75" />
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className={`text-white border-0 card-hover ${balance >= 0 ? '' : 'bg-danger'}`} style={{ background: balance >= 0 ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'linear-gradient(135deg, #eb3349, #f45c43)' }}>
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <Card.Text className="opacity-75" style={{ fontSize: '0.9rem' }}>Balance</Card.Text>
                <h3 className="fw-bold mb-0">${balance.toFixed(2)}</h3>
              </div>
              <FaBalanceScale size={36} className="opacity-75" />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="shadow-sm border-0 mb-4 card-hover">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={3}>
              <Form.Group>
                <Form.Label><FaFilter className="me-1" /> Type</Form.Label>
                <Form.Select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                  <option value="">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label><FaCalendarAlt className="me-1" /> From</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label><FaCalendarAlt className="me-1" /> To</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Button variant="outline-secondary" onClick={clearFilters} className="w-100">
                <FaTimes className="me-1" /> Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Table */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3 text-muted">Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <Card className="shadow-sm border-0 text-center py-5">
          <Card.Body>
            <p className="text-muted mb-0">No transactions found. Start adding your first transaction!</p>
          </Card.Body>
        </Card>
      ) : (
        <Card className="shadow-sm border-0 card-hover">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table striped hover className="mb-0 align-middle">
                <thead className="bg-light">
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Account</th>
                    <th className="text-end">Amount</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn.id}>
                      <td className="text-muted small">{txn.date}</td>
                      <td>
                        {txn.description || '-'}
                        {txn.category && (
                          <Badge
                            pill
                            className="ms-2"
                            style={{
                              backgroundColor: txn.category.color || '#6c757d',
                              color: '#fff'
                            }}
                          >
                            {txn.category.icon} {txn.category.name}
                          </Badge>
                        )}
                      </td>
                      <td>{txn.category?.name || '-'}</td>
                      <td>{txn.account?.name || '-'}</td>
                      <td className={`text-end fw-bold ${txn.type === 'income' ? 'text-success' : 'text-danger'}`}>
                        {txn.type === 'income' ? '+' : '-'}${txn.amount.toFixed(2)}
                      </td>
                      <td className="text-center">
                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(txn.id)} title="Delete">
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default Transactions;