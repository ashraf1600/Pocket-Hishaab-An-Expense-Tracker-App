import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  Row, Col, Card, Table, Spinner, Badge,
  Form, Button, Container, Alert
} from 'react-bootstrap';
import {
  FaArrowUp, FaArrowDown, FaBalanceScale,
  FaWallet, FaCalendarAlt, FaSync, FaFileExport
} from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [allTransactions, setAllTransactions] = useState([]);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  // Initialize month/year
  useEffect(() => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear());
    setSelectedMonth(month);
    setSelectedYear(year);
    setCurrentDate(now.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }));
  }, []);

  // Fetch data when month/year changes
  useEffect(() => {
    if (selectedMonth && selectedYear) {
      fetchDashboardData();
      fetchAllTransactions();
    }
  }, [selectedMonth, selectedYear]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/reports/dashboard', {
        params: { month: parseInt(selectedMonth), year: parseInt(selectedYear) },
      });
      setSummary(res.data);
    } catch (err) {
      console.error('Dashboard error:', err);
      setError(err.response?.data?.detail || 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTransactions = async () => {
    try {
      const startDate = `${selectedYear}-${selectedMonth}-01`;
      const lastDay = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).getDate();
      const endDate = `${selectedYear}-${selectedMonth}-${String(lastDay).padStart(2, '0')}`;
      const res = await api.get('/transactions/', {
        params: { start_date: startDate, end_date: endDate, limit: 200 },
      });
      setAllTransactions(res.data);
    } catch (err) {
      console.error('Transactions error:', err);
      setAllTransactions([]);
    }
  };

  const handleMonthChange = (e) => setSelectedMonth(e.target.value);
  const handleYearChange = (e) => setSelectedYear(e.target.value);
  const handleRefresh = () => { fetchDashboardData(); fetchAllTransactions(); };
  const handleExport = () => alert('Export feature coming soon!');

  const getMonthName = (month) => {
    const names = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return names[parseInt(month)-1];
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
        <p className="mt-3 text-muted">Loading your financial summary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Data</Alert.Heading>
          <p>{error}</p>
          <Button variant="danger" onClick={handleRefresh}>
            <FaSync className="me-2" /> Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  // If summary is null (empty response), show a placeholder
  if (!summary) {
    return (
      <Container className="py-4">
        <p className="text-muted">No data available. Start adding transactions!</p>
      </Container>
    );
  }

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold mb-1">Welcome back, {user?.name}! 👋</h1>
          <p className="text-muted">
            <FaCalendarAlt className="me-2" /> {currentDate}
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <Form.Group className="d-flex align-items-center gap-2">
            <Form.Label className="mb-0 fw-semibold" style={{ fontSize: '0.9rem' }}>
              <FaCalendarAlt className="me-1" /> Month:
            </Form.Label>
            <Form.Select value={selectedMonth} onChange={handleMonthChange} style={{ width: '130px' }} size="sm">
              {Array.from({ length: 12 }, (_, i) => i+1).map(m => (
                <option key={m} value={String(m).padStart(2,'0')}>{getMonthName(m)}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="d-flex align-items-center gap-2">
            <Form.Select value={selectedYear} onChange={handleYearChange} style={{ width: '100px' }} size="sm">
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Button variant="outline-primary" size="sm" onClick={handleRefresh}><FaSync /></Button>
          <Button variant="outline-success" size="sm" onClick={handleExport}><FaFileExport /></Button>
          <Badge bg="primary" className="fs-6 p-2"><FaWallet className="me-1" /> {allTransactions.length} Transactions</Badge>
        </div>
      </div>

      <h5 className="text-muted mb-3">Showing data for: <strong>{getMonthName(selectedMonth)} {selectedYear}</strong></h5>

      <Row className="mb-4 g-3">
        <Col md={4}>
          <Card className="text-white card-hover" style={{ background: 'linear-gradient(135deg, #11998e, #38ef7d)' }}>
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <Card.Text className="opacity-75" style={{ fontSize: '0.9rem' }}>Total Income</Card.Text>
                <h3 className="fw-bold mb-0">${summary?.total_income?.toFixed(2)}</h3>
              </div>
              <FaArrowUp size={36} className="opacity-75" />
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-white card-hover" style={{ background: 'linear-gradient(135deg, #eb3349, #f45c43)' }}>
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <Card.Text className="opacity-75" style={{ fontSize: '0.9rem' }}>Total Expenses</Card.Text>
                <h3 className="fw-bold mb-0">${summary?.total_expense?.toFixed(2)}</h3>
              </div>
              <FaArrowDown size={36} className="opacity-75" />
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className={`text-white card-hover ${summary?.balance >= 0 ? '' : 'bg-danger'}`} style={{ background: summary?.balance >= 0 ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'linear-gradient(135deg, #eb3349, #f45c43)' }}>
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <Card.Text className="opacity-75" style={{ fontSize: '0.9rem' }}>Net Balance</Card.Text>
                <h3 className="fw-bold mb-0">${summary?.balance?.toFixed(2)}</h3>
              </div>
              <FaBalanceScale size={36} className="opacity-75" />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3">
        <Col lg={7}>
          <Card className="card-hover border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom-0 pt-3 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">
                Transaction History {allTransactions.length > 0 && <Badge bg="secondary" className="ms-2">{allTransactions.length}</Badge>}
              </h5>
              <Button variant="link" size="sm" onClick={() => setShowAllTransactions(!showAllTransactions)} className="text-decoration-none">
                {showAllTransactions ? 'Show Less' : 'View All'}
              </Button>
            </Card.Header>
            <Card.Body>
              {allTransactions.length > 0 ? (
                <div style={{ maxHeight: showAllTransactions ? '600px' : '400px', overflowY: 'auto' }}>
                  <Table striped hover responsive className="mb-0">
                    <thead className="sticky-top bg-white">
                      <tr><th>Date</th><th>Description</th><th>Category</th><th className="text-end">Amount</th></tr>
                    </thead>
                    <tbody>
                      {allTransactions.map(txn => (
                        <tr key={txn.id}>
                          <td className="text-muted small">{txn.date}</td>
                          <td>{txn.description || '-'}</td>
                          <td>
                            {txn.category && (
                              <Badge pill style={{ backgroundColor: txn.category.color || '#6c757d' }}>
                                {txn.category.icon} {txn.category.name}
                              </Badge>
                            )}
                          </td>
                          <td className={`text-end fw-bold ${txn.type === 'income' ? 'text-success' : 'text-danger'}`}>
                            {txn.type === 'income' ? '+' : '-'}${txn.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted text-center py-4">No transactions for {getMonthName(selectedMonth)} {selectedYear}.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={5}>
          <Card className="card-hover border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom-0 pt-3">
              <h5 className="fw-bold mb-0">Spending by Category</h5>
            </Card.Header>
            <Card.Body>
              {summary?.spending_by_category?.length > 0 ? (
                summary.spending_by_category.map((cat, idx) => (
                  <div key={idx} className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-semibold">{cat.category_name}</span>
                      <span className="text-muted small">${cat.total.toFixed(2)} ({cat.percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div className="progress-bar" style={{ width: `${Math.min(cat.percentage, 100)}%`, background: `hsl(${Math.min(cat.percentage * 1.2, 120)}, 70%, 50%)` }}></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted text-center py-4">No expense data for {getMonthName(selectedMonth)} {selectedYear}.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Dashboard;