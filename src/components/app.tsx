import React, { FC } from 'react';
import { getFlats } from '../functions/api'
import { FlatContext } from './context';
import '../css/app.css'
import { Main } from '../pages/main';
import { LoanRecommendation } from '../pages/LoanRecommendation';
import { IncomeCalculator } from '../pages/incomeCalculator';
import { Explore } from '../pages/explore';
import { AboutUs } from '../pages/aboutus/aboutus';
import Nav from './navbar/navbar';


// The component that displays the current page.
// Add new pages into the switch statement
type BodyProps = {
  page: string;
  switchTo: (newPage: string) => void;
};
const Body = ({ page, switchTo }: BodyProps) => {
  let component = null;
  switch (page) {
    case "main":
      component = <Main switchTo={switchTo} />;
      break;
    case "explore":
      component = <Explore switchTo={switchTo} />;
      break;
    case "incomeCalculator":
      component = <IncomeCalculator switchTo={switchTo} />;
      break;
    case "loanRecommendation":
      component = <LoanRecommendation switchTo={switchTo} />;
      break;
    case "aboutus":
      component = <AboutUs switchTo={switchTo} />;
      break;
    default:
      component = null;
      break;
  }
  return (
    <div className="app-body">
      {component}
    </div>
  );
};


const App = () => {
  const [flats, setFlats] = React.useState([])
  const [page,setPage] = React.useState("main")

  const switchPage = (newPage: string) => {
    setPage(newPage)
  }
  // To call API only once and store in FlatContext
  React.useEffect(() => {
    getFlats()
    .then(data => setFlats(data))
  }, [])

  return (
    <FlatContext.Provider value={flats}>
      <div className="app">
        <Nav switchTo={switchPage}/>
        <Body page={page} switchTo={switchPage} />
      </div>
    </FlatContext.Provider>
  );
}

export { App,Body }