import './App.css';
import React, { useState, useEffect } from 'react';
import { fakerEN_US, fakerDE, fakerFR, fakerBASE } from '@faker-js/faker';

function App() {
  const totalPages = 999999;
  const [region, setRegion] = useState('fr');
  const [errorCount, setErrorCount] = useState(0);
  const [seed, setSeed] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [userData, setUserData] = useState([]);

  const generateUserDataLocale = (faker) => {
    faker.seed(parseInt(seed));
    const newData = [];
    for (let i = 0; i < currentPage * 10 + 10; i++) {
      const person = {
        index: i+1,
        identifier: faker.string.uuid(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        middleName: faker.person.middleName(),
        address: faker.address.streetAddress(),
        phone: faker.phone.number()
      }

      const personWithError = applyErrors(person,errorCount);
      const fullName = `${personWithError.firstName} ${personWithError.lastName} ${personWithError.middleName}`
      newData.push({index: person.index, identifier: person.identifier, name: fullName, address: personWithError.address, phone: personWithError.phone});
    }

    setUserData(newData);
  };

  const toCSV = (data) => {
    if (data === null || data === undefined || data.length === 0) return data;

    const array = [Object.keys(data[0])].concat(data)
    const mainCSV = array.map(it => {
      return Object.values(it).toString()
    }).join('\n');
    return mainCSV;
  };

  const downloadCSV = () => {
    const csvData = toCSV(userData);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'userData.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const generateUserData = () => {
    if(region === 'fr') {
      generateUserDataLocale(fakerFR);
    } else if (region === 'us') {
      generateUserDataLocale(fakerEN_US);
    } else if (region === 'de') {
      generateUserDataLocale(fakerDE);
    }
  };

  const applyErrors = (personObj, errorCount) => {
    const abc = 'abcdefghijklmnopqrstuvwxyz';
    let modifiedValues = personObj;

    if(errorCount === 0) return personObj;

    let errorProbability = errorCount - parseInt(errorCount);

    if(Math.random() * errorProbability + 1 >= errorProbability) {
      errorCount++;
    }

     for (let i = 0; i < errorCount; i++) {
      let keys = Object.keys(personObj);

      let random = Math.floor( Math.random()*(Object.keys(personObj).length)+2);
      let randomValue = modifiedValues[keys[random]];

      if(randomValue === undefined) continue;

      const randomError = fakerBASE.number.int({ min: 0, max: 2 });
      switch (randomError) {
        case 0:
          // Delete character
          const deleteIndex = fakerBASE.number.int({ min: 0, max: randomValue.length - 1 });
           randomValue =
               randomValue.substring(0, deleteIndex) + randomValue.substring(deleteIndex - 1);
          break;
        case 1:
          // Add random character
          const addIndex = fakerBASE.number.int({ min: 0, max: randomValue.length });
          const randomChar = abc.charAt(fakerBASE.number.int({ min: 0, max: abc.length - 1 }));
          randomValue =
              randomValue.substring(0, addIndex) + randomChar + randomValue.substring(addIndex);
          break;
        case 2:
          // Swap near characters
          const swapIndex = fakerBASE.number.int({ min: 0, max: randomValue.length - 2 });
          randomValue =
              randomValue.substring(0, swapIndex) +
              randomValue.charAt(swapIndex + 1) +
              randomValue.charAt(swapIndex) +
              randomValue.substring(swapIndex + 2);
          break;
        default:
          break;
      }
       modifiedValues[keys[random]] = randomValue;
    }
    return modifiedValues;
  };

  const handleScroll = () => {
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      if (currentPage < totalPages) {
        setCurrentPage((prevPage) => prevPage + 1);
      }
    }
  };

  const handleRegionChange = (e) => {
    setRegion(e.target.value);
  };

  const handleSliderChange = (e) => {
    setErrorCount(parseFloat(e.target.value));
  };

  const handleInputChange = (e) => {
    const value = parseFloat(e.target.value);
    if (value >= 0 && value <= 1000) {
      setErrorCount(value);
    }
  };

  const handleSeedChange = (e) => {
    setSeed(e.target.value);
  };

  const handleRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 1000000).toString();
    setSeed(randomSeed);
  };


  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage]);

  useEffect(() => {
    generateUserData();
  }, [region, errorCount, seed, currentPage]);


  return (
      <div className="">
        <div className="d-flex justify-content-center align-items-center flex-md-column">
          <h1 className="p-2">Fake User Data Generator</h1>
          <div className="d-flex">
            <label className="col-form-label-lg" htmlFor="region">Select Region:</label>
            <select className="form-select-sm m-2" id="region" value={region} onChange={handleRegionChange}>
              <option value="fr">French</option>
              <option value="us">USA</option>
              <option value="de">German</option>
            </select>
          </div>

          <div className="">
            <label className="col-form-label-lg m-2" htmlFor="errorSlider">Number of Errors per Record:</label>
            <input
                className="form-range"
                type="range"
                id="errorSlider"
                min="0"
                max="10"
                step="0.25"
                value={errorCount}
                onChange={handleSliderChange}
            />
            <input
                className="input-group-text"
                type="number"
                id="errorCount"
                min="0"
                max="1000"
                value={errorCount}
                onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="col-form-label-lg" htmlFor="seed">Seed Value:</label>
            <input className="input" type="text" id="seed" value={seed} onChange={handleSeedChange} />
            <button className="btn btn-dark m-1" onClick={handleRandomSeed}>Random</button>
          </div>

          <div>
            <label className="col-form-label-lg" htmlFor="seed">To csv:</label>
            <button className="btn btn-dark" onClick={downloadCSV}>Download</button>
          </div>
        </div>

        <table className={"table"} >
          <thead>
          <tr>
            <th scope="col">Index</th>
            <th scope="col">Identifier</th>
            <th scope="col">Full name</th>
            <th scope="col">Address</th>
            <th scope="col">Phone</th>
          </tr>
          </thead>
          <tbody>
          {userData.map((user) => (
              <tr key={user.index}>
                <td>{user.index}</td>
                <td>{user.identifier}</td>
                <td>{user.name}</td>
                <td>{user.address}</td>
                <td>{user.phone}</td>
              </tr>
          ))}
          </tbody>
        </table>
      </div>
  );
}

export default App;
