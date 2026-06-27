import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { FaExchangeAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Transfer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({
    source_account_id: '',
    destination_account_id: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/accounts/');
      setAccounts(res.data);
    } catch (err) {
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    // Validate amount
    if (parseFloat(form.amount) <= 0) {
      setError('Amount must be greater than zero');
      setSubmitting(false);
      return;
    }

    // Check source and dest different
    if (form.source_account_id === form.destination_account_id) {
      setError('Source and destination accounts must be different');
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
      };
      await api.post('/transactions/transfer', payload);
      toast.success('Transfer completed successfully!');
      navigate('/transactions');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Transfer failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to get account balance
  const getAccountBalance = (id) => {
    const acc = accounts.find(a => a.id === parseInt(id));
    return acc ? acc.balance : 0;
  };

  return (
    <Container fluid className="py-4">
      <Row className="justify-content-center">
        <Col lg={6}>
          <Card className="shadow-sm border-0 card-hover">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0"><FaExchangeAlt className="me-2" /> Transfer Money</h5>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                {/* Source Account */}
                <Form.Group className="mb-3">
                  <Form.Label>From (Source) Account</Form.Label>
                  <Form.Select
                    value={form.source_account_id}
                    onChange={(e) => setForm({ ...form, source_account_id: e.target.value })}
                    required
                  >
                    <option value="">Select source account</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} (Balance: {acc.balance?.toFixed(2)} ৳)
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Destination Account */}
                <Form.Group className="mb-3">
                  <Form.Label>To (Destination) Account</Form.Label>
                  <Form.Select
                    value={form.destination_account_id}
                    onChange={(e) => setForm({ ...form, destination_account_id: e.target.value })}
                    required
                  >
                    <option value="">Select destination account</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} (Balance: {acc.balance?.toFixed(2)} ৳)
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Amount */}
                <Form.Group className="mb-3">
                  <Form.Label>Amount (৳)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Enter amount"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    required
                  />
                </Form.Group>

                {/* Description */}
                <Form.Group className="mb-3">
                  <Form.Label>Description (optional)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Rent payment"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </Form.Group>

                {/* Date */}
                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                  />
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button
                    type="submit"
                    variant="success"
                    className="flex-grow-1"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaExchangeAlt className="me-2" /> Transfer
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

export default Transfer;