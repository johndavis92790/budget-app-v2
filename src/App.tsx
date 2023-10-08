import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RecurringExpensesPage from "./components/RecurringExpensesPage";
import NonRecurringExpensesPage from "./components/NonRecurringExpensesPage";
import HistoryPage from "./components/HistoryPage";
import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";
import { auth } from "./utils/firebase";
import { Login } from "./components/Login";
import { UserContext } from "./utils/UserContext";
import { BudgetNavbar } from "./components/Navbar";

const allowedEmails = [
  process.env.REACT_APP_EMAIL_1,
  process.env.REACT_APP_EMAIL_2,
];

const App: React.FC = () => {
  const [user, setUser] = useState(null as User | null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user && allowedEmails.includes(user.email || "")) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
  }, []);

  function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  }

  function handleSignOut() {
    signOut(auth);
  }

  return (
    <div className="App">
      <BrowserRouter>
        <UserContext.Provider
          value={{ user, setUser, signInWithGoogle, handleSignOut, loading }}
        >
          <BudgetNavbar />
          <Routes>
            <Route path="/" />
            <Route path="/recurring" element={<RecurringExpensesPage />} />
            <Route
              path="/non-recurring"
              element={<NonRecurringExpensesPage />}
            />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="login" element={<Login />} />
          </Routes>
        </UserContext.Provider>
      </BrowserRouter>
    </div>
  );
};

export default App;
