import { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Form, Button,
  ListGroup, Spinner, Badge, Alert
} from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaWallet, FaMoneyBillWave } from 'react-icons/fa';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'cash', balance: 0, currency: 'BDT' });

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
    try {
      const payload = { ...form, balance: parseFloat(form.balance) };
      if (editing) {
        await api.put(`/accounts/${editing}`, payload);
        toast.success('Account updated!');
      } else {
        await api.post('/accounts/', payload);
        toast.success('Account created!');
      }
      setForm({ name: '', type: 'cash', balance: 0, currency: 'BDT' });
      setEditing(null);
      fetchAccounts();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this account?')) return;
    try {
      await api.delete(`/accounts/${id}`);
      toast.success('Account deleted!');
      fetchAccounts();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleEdit = (acc) => {
    setEditing(acc.id);
    setForm({ name: acc.name, type: acc.type, balance: acc.balance, currency: acc.currency || 'BDT' });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ name: '', type: 'cash', balance: 0, currency: 'BDT' });
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  // Account type badge colors
  const getBadgeColor = (type) => {
    switch (type) {
      case 'cash': return 'success';
      case 'bank': return 'primary';
      case 'credit_card': return 'warning';
      case 'mobile_banking': return 'info';
      default: return 'secondary';
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold mb-0 d-flex align-items-center">
            <FaWallet className="me-2 text-primary" /> Accounts
          </h1>
          <p className="text-muted mb-0">
            Manage your bank, cash, and credit card accounts
          </p>
        </div>
        <div className="text-end">
          <div className="fw-bold fs-4 text-success">
            {totalBalance.toFixed(2)} ৳
          </div>
          <small className="text-muted">Total Balance</small>
        </div>
      </div>

      <Row>
        <Col lg={5} className="mb-4">
          <Card className="shadow-sm border-0 card-hover">
            <Card.Header
              className="text-white"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              <h5 className="mb-0">
                {editing ? <FaEdit className="me-2" /> : <FaPlus className="me-2" />}
                {editing ? 'Edit Account' : 'New Account'}
              </h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Account Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., My Bank"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="cash">Cash</option>
                    <option value="bank">Bank</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="mobile_banking">Mobile Banking</option>
                  </Form.Select>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Balance (৳)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        value={form.balance}
                        onChange={(e) => setForm({ ...form, balance: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Currency</Form.Label>
                      <Form.Control
                        type="text"
                        value={form.currency}
                        onChange={(e) => setForm({ ...form, currency: e.target.value })}
                        placeholder="BDT"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex gap-2">
                  <Button type="submit" variant="primary" className="px-4">
                    {editing ? 'Update' : 'Create'}
                  </Button>
                  {editing && (
                    <Button variant="secondary" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={7}>
          <Card className="shadow-sm border-0 card-hover">
            <Card.Header className="bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Your Accounts</h5>
              <Badge bg="primary" pill>
                {accounts.length} total
              </Badge>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : accounts.length === 0 ? (
                <Alert variant="info" className="text-center">
                  No accounts yet. Create your first account!
                </Alert>
              ) : (
                <ListGroup variant="flush">
                  {accounts.map((acc) => (
                    <ListGroup.Item
                      key={acc.id}
                      className="d-flex justify-content-between align-items-center py-3"
                    >
                      <div>
                        <h6 className="mb-0">
                          {acc.name}
                          <Badge bg={getBadgeColor(acc.type)} className="ms-2">
                            {acc.type.replace('_', ' ')}
                          </Badge>
                        </h6>
                        <small className="text-muted">
                          <FaMoneyBillWave className="me-1" />
                          Balance: <strong>{acc.balance?.toFixed(2)} ৳</strong>
                        </small>
                      </div>
                      <div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(acc)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(acc.id)}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Accounts;