import React from 'react';
import { useEffect, useState } from 'react';
import { Timestamp } from "firebase/firestore";
import { Auth } from '../componet/auth.js';
import { db } from '../config/firebase.js';
import { getDocs, collection, addDoc } from 'firebase/firestore';



export const Home = () => {
    const [carList, setCarList] = useState([]);

    const [make, setMake] = useState("")
    const [model, setModel] = useState("")
    const [mileage, setMileage] = useState(0)
    const [lastOilChangeMileage, setLastOilChangeMileage] = useState(0)
    const [maintMileageInterval, setMaintMileageInterval] = useState(0)
    const [lastOilChangeDate, setLastOilChangeDate] = useState()
    const [maintIntervalInDays, setMaintIntervalInDays] = useState("")
    const [isDueForMaint, setIsDueForMaint ] = useState(false)

    const carsCollectionRef = collection(db, "Cars")

    useEffect(() => {
        getCarList()
    }, [])

    const getCarList = async () => {
        try {
            const data = await getDocs(carsCollectionRef);
            const filteredData = data.docs.map((doc) => {
                const data = doc.data();
                return {
                    ...data,
                    id: doc.id,
                    lastOilChangeDate: data.lastOilChangeDate instanceof Timestamp 
                        ? data.lastOilChangeDate.toDate().toLocaleDateString()
                        : data.lastOilChangeDate
                };
            });
            setCarList(filteredData)
            console.log(filteredData)

        } catch (err) {
            console.error(err)
        }
    }

    const onSubmitCar = async () => {
        try {
            await addDoc(carsCollectionRef, {
                make: make,
                model: model,
                mileage: mileage,
                lastOilChangeMileage: lastOilChangeMileage,
                maintMileageInterval: maintMileageInterval,
                lastOilChangeDate: Timestamp.fromDate(new Date(lastOilChangeDate)),
                maintIntervalInDays: maintIntervalInDays,
                isDueForMaint: isDueForMaint
            })
            getCarList()
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="text-center mt-5">
            <h1>Hello World Firebase!!</h1>

            <Auth />
            <div>
                <input 
                    placeholder="Make..." 
                    onChange={((e) => setMake(e.target.value))}
                />
                <input 
                    placeholder="Model..." 
                    onChange={((e) => setModel(e.target.value))}    
                />
                <input 
                    placeholder="Mileage..." 
                    type="number" 
                    onChange={((e) => setMileage(Number(e.target.value)))}    
                />
                <input 
                    placeholder="Last Oil Change Mileage..." 
                    type="number" 
                    onChange={((e) => setLastOilChangeMileage(Number(e.target.value)))}    
                />
                <input 
                    placeholder="Maintenance Mileage Interval..." 
                    type="number" 
                    onChange={((e) => setMaintMileageInterval(Number(e.target.value)))}    
                />
                <input 
                    placeholder="Last Oil Change Date..." 
                    type="date" 
                    onChange={((e) => setLastOilChangeDate(e.target.value))}    
                />
                <input 
                    placeholder="Maintenance Time Interval In Days..." 
                    type="number" 
                    onChange={((e) => setMaintIntervalInDays(Number(e.target.value)))}    
                />
                <div>
                    <input 
                        placeholder="isDueForMaint..."
                        className="mx-2" 
                        type="checkbox"
                        checked={isDueForMaint}
                        onChange={(e) => setIsDueForMaint(e.target.checked) } 
                    />
                    <label> Is Due for Maintenance</label>
                </div>
                <button onClick={onSubmitCar} > Submit New Car </button>

            </div>
            <div>
                {carList.map((car) => (
                    <div className="container">
                        <h4 style={{ color: car.isDueForMaint ? "green" : "red" }}>{`${car.make} ${car.model}`}</h4>
                        <h4>Mileage: {car.mileage}</h4>
                        <h4>Miles Between Oil Changes: {car.maintMileageInterval}</h4>
                        <h4>Last Oil Change Date: {car.lastOilChangeDate}</h4>
                        <h4>Days Between Oil Changes: {car.maintIntervalInDays}</h4>
                        <h4>Days Between Oil Changes: {car.maintIntervalInDays}</h4> 
                        

                    </div>
                ))}
            </div>

        </div>
    );
};
