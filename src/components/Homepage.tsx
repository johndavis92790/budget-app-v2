import { BudgetNavbar } from "./Navbar";

declare global {
  interface Window {
    _HB_: any;
  }
}

export function Homepage() {


  return (
    <>
    <BudgetNavbar />
    </>
  );
}
