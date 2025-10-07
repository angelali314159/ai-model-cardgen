import React, { useState } from 'react';
import Header from './components/Header';
import Updates from './pages/Updates';
import GenerateModel from './pages/GenerateModel';
import GenerateModelForm from './pages/GenerateModelForm';
import AboutUs from './pages/AboutUs';
import Footer from "./components/Footer";
import './styles/App.css';

function App() {
  const [activeTab, setActiveTab] = useState('Generate Model');

  const renderContent = () => {
    switch (activeTab) {
      case 'Updates':
        return <Updates />;
      case 'Generate Model':
        return <GenerateModelForm />;
      case 'About Us':
        return <AboutUs />;
      default:
        return <GenerateModel />;
    }
  };

  return (
    <div className="App">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
}

export default App;