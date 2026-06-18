import { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Form, Button,
  ListGroup, Badge, Spinner, FloatingLabel,
  InputGroup
} from 'react-bootstrap';
import {
  FaPlus, FaEdit, FaTrash, FaTag,
  FaPalette, FaList, FaTimes
} from 'react-icons/fa';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'expense',
    icon: '📁',
    color: '#808080',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories/');
      setCategories(res.data);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/categories/${editing}`, form);
        toast.success('Category updated!');
      } else {
        await api.post('/categories/', form);
        toast.success('Category created!');
      }
      setForm({ name: '', type: 'expense', icon: '📁', color: '#808080' });
      setEditing(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Deleted!');
      fetchCategories();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const editCategory = (cat) => {
    setEditing(cat.id);
    setForm({
      name: cat.name,
      type: cat.type,
      icon: cat.icon || '📁',
      color: cat.color || '#808080',
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ name: '', type: 'expense', icon: '📁', color: '#808080' });
  };

  // Counts for badges
  const incomeCount = categories.filter(c => c.type === 'income').length;
  const expenseCount = categories.filter(c => c.type === 'expense').length;

  return (
    <>
      <Navbar />
      <Container fluid className="py-4">
        <h1 className="mb-4 d-flex align-items-center">
          <FaTag className="me-2 text-primary" /> Categories
          <Badge bg="secondary" className="ms-3 fs-6">
            {categories.length} total
          </Badge>
        </h1>

        <Row>
          {/* Form Card – Create/Edit */}
          <Col lg={5} className="mb-4">
            <Card className="shadow-sm border-0 card-hover">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                  {editing ? <FaEdit className="me-2" /> : <FaPlus className="me-2" />}
                  {editing ? 'Edit Category' : 'New Category'}
                </h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  {/* Name */}
                  <FloatingLabel label="Category Name" className="mb-3">
                    <Form.Control
                      type="text"
                      placeholder="e.g., Groceries"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </FloatingLabel>

                  {/* Type */}
                  <Form.Group className="mb-3">
                    <Form.Label>Type</Form.Label>
                    <Form.Select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </Form.Select>
                  </Form.Group>

                  {/* Icon & Color side by side */}
                  <Row>
                    <Col md={7}>
                      <FloatingLabel label="Icon (emoji)" className="mb-3">
                        <Form.Control
                          type="text"
                          placeholder="🍔"
                          value={form.icon}
                          onChange={(e) => setForm({ ...form, icon: e.target.value })}
                          maxLength={2}
                        />
                      </FloatingLabel>
                    </Col>
                    <Col md={5}>
                      <Form.Group className="mb-3">
                        <Form.Label>Color</Form.Label>
                        <InputGroup>
                          <Form.Control
                            type="color"
                            value={form.color}
                            onChange={(e) => setForm({ ...form, color: e.target.value })}
                            style={{ padding: '2px', height: '38px' }}
                          />
                          <InputGroup.Text style={{ minWidth: '60px' }}>
                            {form.color}
                          </InputGroup.Text>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Preview */}
                  <div className="bg-light p-3 rounded-3 mb-3 text-center">
                    <span style={{ fontSize: '2rem', color: form.color }}>
                      {form.icon || '📁'}
                    </span>
                    <span className="ms-3 fw-bold">
                      {form.name || 'Category Name'}
                    </span>
                    <Badge bg={form.type === 'income' ? 'success' : 'danger'} className="ms-2">
                      {form.type}
                    </Badge>
                  </div>

                  <div className="d-flex gap-2">
                    <Button
                      type="submit"
                      variant="primary"
                      className="flex-grow-1"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                      ) : null}
                      {editing ? 'Update' : 'Create'}
                    </Button>
                    {editing && (
                      <Button variant="secondary" onClick={cancelEdit}>
                        <FaTimes /> Cancel
                      </Button>
                    )}
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* List Card */}
          <Col lg={7}>
            <Card className="shadow-sm border-0 card-hover">
              <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Your Categories</h5>
                <div>
                  <Badge bg="success" className="me-1">Income {incomeCount}</Badge>
                  <Badge bg="danger">Expense {expenseCount}</Badge>
                </div>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : categories.length === 0 ? (
                  <p className="text-muted text-center py-4">No categories yet. Create one!</p>
                ) : (
                  <ListGroup variant="flush">
                    {categories.map((cat) => (
                      <ListGroup.Item
                        key={cat.id}
                        className="d-flex justify-content-between align-items-center py-3"
                      >
                        <div className="d-flex align-items-center">
                          <span
                            style={{
                              fontSize: '1.5rem',
                              width: '40px',
                              textAlign: 'center',
                              color: cat.color,
                            }}
                          >
                            {cat.icon}
                          </span>
                          <div className="ms-3">
                            <div className="fw-semibold">{cat.name}</div>
                            <Badge bg={cat.type === 'income' ? 'success' : 'danger'} pill>
                              {cat.type}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-1"
                            onClick={() => editCategory(cat)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(cat.id)}
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

export default Categories;