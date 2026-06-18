import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, ListGroup, Spinner, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaWallet } from 'react-icons/fa';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'cash', balance: 0, currency: 'USD' });

  useEffect(() => { fetchAccounts(); }, []);

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
      setForm({ name: '', type: 'cash', balance: 0, currency: 'USD' });
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
    setForm({ name: acc.name, type: acc.type, balance: acc.balance, currency: acc.currency });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ name: '', type: 'cash', balance: 0, currency: 'USD' });
  };

  return (
    <>
      <Navbar />
      <Container fluid className="py-4">
        <h1 className="mb-4 d-flex align-items-center">
          <FaWallet className="me-2 text-primary" /> Accounts
        </h1>

        <Row>
          {/* ---- ফর্ম (Create/Edit) ---- */}
          <Col lg={5} className="mb-4">
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">{editing ? '✏️ Edit Account' : '➕ New Account'}</h5>
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
                    </Form.Select>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Balance</Form.Label>
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
                          placeholder="USD"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex gap-2">
                    <Button type="submit" variant="primary">
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

          {/* ---- অ্যাকাউন্টের তালিকা ---- */}
          <Col lg={7}>
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-light">
                <h5 className="mb-0">Your Accounts</h5>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : accounts.length === 0 ? (
                  <p className="text-muted text-center py-4">No accounts yet. Create one!</p>
                ) : (
                  <ListGroup variant="flush">
                    {accounts.map((acc) => (
                      <ListGroup.Item key={acc.id} className="d-flex justify-content-between align-items-center py-3">
                        <div>
                          <h6 className="mb-0">
                            {acc.name}
                            <Badge bg="secondary" className="ms-2">
                              {acc.type.replace('_', ' ')}
                            </Badge>
                          </h6>
                          <small className="text-muted">
                            Balance: <strong>${acc.balance?.toFixed(2)}</strong> {acc.currency}
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
    </>
  );
};

export default Accounts;