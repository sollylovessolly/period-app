import React, { useEffect, useRef, useState } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Modal from 'react-modal';
import styles from './PeriodCalculator.module.css';


registerLocale('en-US', require('date-fns/locale/en-US'));

const PeriodTracker = () => {
  const [lastPeriod, setLastPeriod] = useState('');
  const [cycleAverage, setCycleAverage] = useState(0);
  const [periodAverage, setPeriodAverage] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [event, setEvent] = useState('');
  const [showModal, setShowModal] = useState(false);

  const modalRef = useRef(null);

  const calculatePeriodCycle = () => {
    if (!lastPeriod || !cycleAverage || !periodAverage) return;

    const periodStartDate = new Date(lastPeriod);
    periodStartDate.setDate(periodStartDate.getDate() + cycleAverage);
    const periodEndDate = new Date(periodStartDate);
    periodEndDate.setDate(periodEndDate.getDate() + periodAverage);
    const ovulationDate = new Date(periodStartDate);
    ovulationDate.setDate(ovulationDate.getDate() + Math.floor(cycleAverage / 2));
    const fertilityWindowStart = new Date(ovulationDate);
    fertilityWindowStart.setDate(ovulationDate.getDate() - 4);
    const fertilityWindowEnd = new Date(ovulationDate);
    fertilityWindowEnd.setDate(ovulationDate.getDate() + 4);
    const preOvulationWindowStart = new Date(periodEndDate);
    preOvulationWindowStart.setDate(periodEndDate.getDate() + 1);
    const preOvulationWindowEnd = new Date(fertilityWindowStart);
    preOvulationWindowEnd.setDate(fertilityWindowStart.getDate() - 1);
    const postOvulationWindowStart = new Date(fertilityWindowEnd);
    postOvulationWindowStart.setDate(fertilityWindowEnd.getDate() + 1);
    const postOvulationWindowEnd = new Date(periodStartDate);
    postOvulationWindowEnd.setDate(periodStartDate.getDate() - 1);

    return {
      periodStartDate,
      periodEndDate,
      ovulationDate,
      fertilityWindowStart,
      fertilityWindowEnd,
      preOvulationWindowStart,
      preOvulationWindowEnd,
      postOvulationWindowStart,
      postOvulationWindowEnd,
    };
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    switch (name) {
      case 'lastPeriod':
        setLastPeriod(value);
        break;
      case 'cycleAverage':
        setCycleAverage(parseFloat(value));
        break;
      case 'periodAverage':
        setPeriodAverage(parseFloat(value));
        break;
      case 'startDate':
        setStartDate(new Date(value));
        break;
      case 'endDate':
        setEndDate(new Date(value));
        break;
      default:
        break;
    }
  };

  const handleCheckStatus = () => {
    if (!lastPeriod || !cycleAverage || !periodAverage) return;
    setShowModal(true); 
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (lastPeriod && cycleAverage && periodAverage) {
      const periodCycle = calculatePeriodCycle();
      if (date) {
        const dateObject = new Date(date);
        dateObject.setHours(0, 0, 0, 0); 
  
        if (dateObject >= periodCycle.periodStartDate && dateObject <= periodCycle.periodEndDate) {
          setEvent('Period');
        } else if (dateObject.getTime() === periodCycle.ovulationDate.getTime()) {
          setEvent('Ovulation');
        } else if (dateObject >= periodCycle.fertilityWindowStart && dateObject <= periodCycle.fertilityWindowEnd) {
          setEvent('Fertility Window');
        } else if (dateObject > periodCycle.periodEndDate && dateObject < periodCycle.preOvulationWindowStart) {
          setEvent('Pre-Ovulation');
        } else if (dateObject > periodCycle.fertilityWindowEnd && dateObject < periodCycle.postOvulationWindowStart) {
          setEvent('Post-Ovulation');
        } else {
          setEvent('No Event');
        }
      }
    }
  };
   
  
    const handleCloseModal = () => {
      setShowModal(false);
    };
  
    useEffect(() => {
      const handleEscape = (event) => {
        if (event.key === 'Escape' && showModal) {
          setShowModal(false);
        }
      };
  
      document.addEventListener('keydown', handleEscape);
  
      return () => document.removeEventListener('keydown', handleEscape);
    }, [showModal]);
  
    return (
      <div className={styles.periodTracker}>
        <h1>Period Tracker</h1>
        <form>
          <label htmlFor="lastPeriod">Last Period:</label>
          <input type="date" id="lastPeriod" name="lastPeriod" value={lastPeriod} onChange={handleInputChange} />
          <br />
          <label htmlFor="cycleAverage">Cycle Average (days):</label>
          <input type="number" id="cycleAverage" name="cycleAverage" value={cycleAverage} onChange={handleInputChange} />
          <br />
          <label htmlFor="periodAverage">Period Average (days):</label>
          <input type="number" id="periodAverage" name="periodAverage" value={periodAverage} onChange={handleInputChange} />
          <br />
          <label htmlFor="startDate">Start Date (optional):</label>
          <input type="date" id="startDate" name="startDate" value={startDate?.toISOString().slice(0, 10)} onChange={handleInputChange} />
          <br />
          <label htmlFor="endDate">End Date (optional):</label>
          <input type="date" id="endDate" name="endDate" value={endDate?.toISOString().slice(0, 10)} onChange={handleInputChange} />
          <br />
        </form>
        <button className={styles.button}  onClick={handleCheckStatus}>Check Periodic Status</button>
  
        {showModal && (
          <Modal
            isOpen={showModal}
            contentLabel="Select Date for Period Status"
            onRequestClose={handleCloseModal}
            style={{
              overlay: {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              },
              content: {
                ...styles.modalContent,
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'white',
                padding: '20px',
                border: '1px solid #ccc',
                borderRadius: '5px',
              },
            }}
          >
            <h2>Select Date:</h2>
            <DatePicker selected={selectedDate} onChange={handleDateChange} />
            {selectedDate && (
              <>
                <h2>Event: {event}</h2>
                {event && <p>Selected date falls within the {event} phase of your cycle.</p>}
              </>
            )}
          </Modal>
        )}
      </div>
    );
  };
  
  export default PeriodTracker;
  