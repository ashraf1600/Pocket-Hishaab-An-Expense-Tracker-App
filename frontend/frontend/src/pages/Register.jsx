import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, InputGroup } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const { register } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }
    register(name, email, password);
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center min-vh-100"
      style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5} xl={4}>
            <Card className="shadow-lg border-0 rounded-4 p-3">
              <Card.Body>
                {/* প্রোফাইল আইকন (শুধু ডেকোরেশন) */}
                <div className="text-center mb-4">
                  <div
                    className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center"
                    style={{ width: '70px', height: '70px' }}
                  >
                    <FaUser size={32} color="white" />
                  </div>
                  <h4 className="mt-3 fw-bold">Create Account</h4>
                  <p className="text-muted small">Join us and start tracking expenses</p>
                </div>

                <Form onSubmit={handleSubmit}>
                  {/* নাম */}
                  <Form.Floating className="mb-3">
                    <Form.Control
                      id="floatingName"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <label htmlFor="floatingName">
                      <FaUser className="me-2" /> Full Name
                    </label>
                  </Form.Floating>

                  {/* ইমেইল */}
                  <Form.Floating className="mb-3">
                    <Form.Control
                      id="floatingEmail"
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <label htmlFor="floatingEmail">
                      <FaEnvelope className="me-2" /> Email address
                    </label>
                  </Form.Floating>

                  {/* পাসওয়ার্ড (টগল সহ) */}
                  <Form.Floating className="mb-3">
                    <InputGroup>
                      <Form.Control
                        id="floatingPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </InputGroup>
                    <label htmlFor="floatingPassword">
                      <FaLock className="me-2" /> Password
                    </label>
                  </Form.Floating>

                  {/* টার্মস চেকবক্স */}
                  <Form.Check
                    type="checkbox"
                    id="termsCheck"
                    label="I agree to the Terms & Conditions"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mb-3"
                  />

                  {/* রেজিস্টার বাটন */}
                  <Button
                    type="submit"
                    className="w-100 py-2 fw-bold"
                    style={{
                      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => (e.target.style.transform = 'scale(1.02)')}
                    onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                  >
                    Create Account
                  </Button>

                  {/* লগইন লিঙ্ক */}
                  <div className="text-center mt-3">
                    <small>
                      Already have an account?{' '}
                      <Link to="/login" className="text-decoration-none fw-semibold" style={{ color: '#764ba2' }}>
                        Login
                      </Link>
                    </small>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;