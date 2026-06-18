import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, ListGroup, ProgressBar, Badge, FloatingLabel } from 'react-bootstrap';
import { FaPlus, FaTrash, FaChartPie, FaCalendar, FaDollarSign } from 'react-icons/fa';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    category_id: '',
    amount: '',
    period: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
  });

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, []);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/budgets/');
      setBudgets(res.data);
    } catch (err) {
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories/');
      // শুধুমাত্র Expense ক্যাটেগরি দেখাব (বাজেট শুধু খরচের জন্য)
      setCategories(res.data.filter(c => c.type === 'expense'));
    } catch (err) {
      // ignore
    }
  };

  // ক্যাটেগরি আইডি থেকে নাম বের করা
  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : 'Unknown';
  };

  const getCategoryIcon = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.icon : '📁';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/budgets/', {
        ...form,
        amount: parseFloat(form.amount),
        end_date: form.end_date || null,
      });
      toast.success('Budget created successfully!');
      setForm({
        category_id: '',
        amount: '',
        period: 'monthly',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
      });
      fetchBudgets();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create budget');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
    try {
      await api.delete(`/budgets/${id}`);
      toast.success('Budget deleted!');
      fetchBudgets();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <>
      <Navbar />
      <Container fluid className="py-4">
        <h1 className="mb-4 d-flex align-items-center">
          <FaChartPie className="me-2 text-primary" /> Budgets
        </h1>

        <Row>
          {/* ফর্ম (Create Budget) */}
          <Col lg={5} className="mb-4">
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                  <FaPlus className="me-2" /> Create New Budget
                </h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  {/* ক্যাটেগরি সিলেক্ট */}
                  <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Select
                      value={form.category_id}
                      onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                      required
                    >
                      <option value="">Select an expense category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  {/* Amount */}
                  <Form.Group className="mb-3">
                    <Form.Label>Budget Amount ($)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="e.g., 500"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      required
                    />
                  </Form.Group>

                  {/* Period */}
                  <Form.Group className="mb-3">
                    <Form.Label>Period</Form.Label>
                    <Form.Select
                      value={form.period}
                      onChange={(e) => setForm({ ...form, period: e.target.value })}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </Form.Select>
                  </Form.Group>

                  {/* Start Date */}
                  <Form.Group className="mb-3">
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={form.start_date}
                      onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                      required
                    />
                  </Form.Group>

                  {/* End Date (optional) */}
                  <Form.Group className="mb-3">
                    <Form.Label>End Date (optional)</Form.Label>
                    <Form.Control
                      type="date"
                      value={form.end_date}
                      onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                        Creating...
                      </>
                    ) : (
                      'Create Budget'
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* বাজেটের তালিকা */}
          <Col lg={7}>
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-light">
                <h5 className="mb-0">Your Budgets</h5>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : budgets.length === 0 ? (
                  <p className="text-muted text-center py-4">
                    No budgets yet. Create your first budget!
                  </p>
                ) : (
                  <ListGroup variant="flush">
                    {budgets.map((budget) => {
                      const spent = budget.spent || 0;
                      const percentage = budget.percentage_used || 0;
                      const remaining = budget.remaining || 0;
                      const categoryName = getCategoryName(budget.category_id);
                      const categoryIcon = getCategoryIcon(budget.category_id);

                      return (
                        <ListGroup.Item key={budget.id} className="py-3">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <h6 className="mb-1">
                                {categoryIcon} {categoryName}
                                <Badge bg="secondary" className="ms-2">
                                  {budget.period}
                                </Badge>
                              </h6>
                              <div className="d-flex flex-wrap gap-3 mt-2">
                                <span className="text-muted small">
                                  <FaDollarSign className="me-1" />
                                  Budget: <strong>${budget.amount.toFixed(2)}</strong>
                                </span>
                                <span className="text-muted small">
                                  Spent: <strong className="text-danger">${spent.toFixed(2)}</strong>
                                </span>
                                <span className="text-muted small">
                                  Remaining: <strong className="text-success">${remaining.toFixed(2)}</strong>
                                </span>
                                <span className="text-muted small">
                                  <FaCalendar className="me-1" />
                                  {budget.start_date}
                                  {budget.end_date && ` → ${budget.end_date}`}
                                </span>
                              </div>
                              <div className="mt-2">
                                <ProgressBar
                                  now={Math.min(percentage, 100)}
                                  label={`${percentage.toFixed(0)}%`}
                                  variant={percentage > 90 ? 'danger' : percentage > 70 ? 'warning' : 'success'}
                                  style={{ height: '20px' }}
                                />
                              </div>
                            </div>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(budget.id)}
                              className="ms-3"
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </ListGroup.Item>
                      );
                    })}
                  </ListGroup>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Budgets;