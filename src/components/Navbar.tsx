import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { useUserContext } from "../utils/UserContext";

export function BudgetNavbar({ sticky = true }) {
  const contextValue = useUserContext();
  const { user, signInWithGoogle, handleSignOut } = contextValue ?? {
    user: null,
  };
  return (
    <>
      <Navbar bg="light" expand="lg" sticky={sticky ? "top" : undefined}>
        <Container className="nav-container">
          <Navbar.Brand></Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/">HOME</Nav.Link>
              <NavDropdown title="Admin Links" id="navbarScrollingDropdown">
                {user ? (
                  <>
                    <NavDropdown.Item onClick={handleSignOut}>
                      LOGOUT
                    </NavDropdown.Item>

                  </>
                ) : (
                  <>
                    <NavDropdown.Item onClick={signInWithGoogle}>
                      LOGIN
                    </NavDropdown.Item>
                  </>
                )}
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}
