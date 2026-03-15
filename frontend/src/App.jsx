import Header from "./components/Header/Header";
import Features from "./components/Features/Features";
import Footer from "./components/Footer/Footer";
import { useRef } from "react";
import { Routes, Route } from "react-router-dom";
import AuthPage from "./components/AuthPage/AuthPage";
import Welcome from "./components/Welcome/Welcome";
import DashBoard from "./components/DashBoard/DashBoard";
import AcademicPeriods from "./components/TimeTableSections/AcademicPeriods";
import TimetablesLayout from "./components/Timetables/TimetablesLayout";
import Rooms from "./components/TimeTableSections/Rooms";
import Faculty from "./components/TimeTableSections/Faculty";
import BatchPage from "./components/TimeTableSections/BatchPage";
import SubjectPage from "./components/TimeTableSections/SubjectPage";
import DepartmentSetup from "./components/Department/DepartmentSetup";
import SavedTimetables from "./components/SavedTimetables/SavedTimetables";

function App() {
  const featuresRef = useRef(null);
  const aboutRef = useRef(null);

  return (
    <div className="app-container">
      
      <Routes>

        <Route
          path="/"
          element={
            <>
              <Header featuresRef={ featuresRef } aboutRef={ aboutRef } />
              <Features featuresRef={featuresRef} />
              <Footer aboutRef={aboutRef} />
            </>
          }
        />

        <Route path="/login" element={<AuthPage />} />

        <Route path="/welcome" element={<Welcome />} />

        <Route path="/timetables" element={<TimetablesLayout />}>
          <Route index element={<SavedTimetables />} />

          <Route path=":timetableId">
            <Route index element={<DashBoard />} />

            <Route path="academic-periods" element={<AcademicPeriods />} />
            <Route path="rooms" element={<Rooms />} />
            <Route path="faculty" element={<Faculty />} />
            
            <Route path=":departmentId" element={<DepartmentSetup />} />     
            <Route path=":departmentId/batches" element={<BatchPage />} />    
            <Route path=":departmentId/subjects" element={<SubjectPage />} />     
          </Route>
        </Route>

      </Routes>

    </div>
  );
}

export default App;
