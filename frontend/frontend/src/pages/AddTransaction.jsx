import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Row, Col, Card, Form, Button,
  FloatingLabel, Spinner, Badge
} from 'react-bootstrap';
import {
  FaArrowLeft, FaPlus, FaDollarSign, FaTag,
  FaWallet, FaAlignLeft, FaCalendarAlt,
  FaExchangeAlt
} from 'react-icons/fa';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AddTransaction = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({
    account_id: '',
    category_id: '',
    amount: '',
    type: 'expense',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, accRes] = await Promise.all([
          api.get('/categories/'),
          api.get('/accounts/'),
        ]);
        setCategories(catRes.data);
        setAccounts(accRes.data);
      } catch (err) {
        toast.error('Failed to load categories & accounts');
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/transactions/', {
        ...form,
        amount: parseFloat(form.amount),
      });
      toast.success('Transaction added successfully!');
      navigate('/transactions');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add transaction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="justify-content-center">
        <Col lg={8} xl={6}>
          <Card className="shadow-sm border-0 card-hover">
            <Card.Header className="bg-primary text-white d-flex align-items-center">
              <FaPlus className="me-2" />
              <h5 className="mb-0">Add New Transaction</h5>
              <Button
                variant="outline-light"
                size="sm"
                className="ms-auto"
                onClick={() => navigate('/transactions')}
              >
                <FaArrowLeft className="me-1" /> Back
              </Button>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {/* Type */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaExchangeAlt className="me-1 text-primary" /> Type
                  </Form.Label>
                  <Form.Select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    required
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </Form.Select>
                </Form.Group>

                {/* Amount */}
                <FloatingLabel label="Amount ($)" className="mb-3">
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    required
                  />
                </FloatingLabel>

                {/* Category */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaTag className="me-1 text-primary" /> Category
                  </Form.Label>
                  <Form.Select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Account */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaWallet className="me-1 text-primary" /> Account
                  </Form.Label>
                  <Form.Select
                    value={form.account_id}
                    onChange={(e) => setForm({ ...form, account_id: e.target.value })}
                    required
                  >
                    <option value="">Select an account</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} (${acc.balance?.toFixed(2)})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Description */}
                <FloatingLabel label="Description (optional)" className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Optional description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </FloatingLabel>

                {/* Date */}
                <FloatingLabel label="Date" className="mb-4">
                  <Form.Control
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                  />
                </FloatingLabel>

                {/* Buttons */}
                <div className="d-flex gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-grow-1"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <FaPlus className="me-2" /> Add Transaction
                      </>
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/transactions')}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AddTransaction;