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
    const [isDueForMaint, setIsDueForMaint] = useState(false)

    const carsCollectionRef = collection(db, "Cars")

    useEffect(() => {
        getCarList()
    }, [])

    const getCarList = async () => {
        try {
            const data = await getDocs(carsCollectionRef);
            const filteredData = data.docs.map((doc) => {
                const data = doc.data();

                // Calculate mileage-related values
                const currentMileage = data.mileage;
                const lastOilChangeMileage = data.lastOilChangeMileage;
                const maintInterval = data.maintMileageInterval;

                // Calculate miles until next oil change
                const milesUntilChange = (lastOilChangeMileage + maintInterval) - currentMileage;
                const milesPastDue = milesUntilChange < 0 ? Math.abs(milesUntilChange) : 0;

                // Calculate days-related values
                const lastOilChangeDate = data.lastOilChangeDate instanceof Timestamp
                    ? data.lastOilChangeDate.toDate()
                    : new Date(data.lastOilChangeDate);

                const today = new Date();
                const daysSinceLastChange = Math.floor((today - lastOilChangeDate) / (1000 * 60 * 60 * 24));
                const daysUntilChange = data.maintIntervalInDays - daysSinceLastChange;
                const daysOverdue = daysUntilChange < 0 ? Math.abs(daysUntilChange) : 0;

                return {
                    ...data,
                    id: doc.id,
                    lastOilChangeDate: lastOilChangeDate.toLocaleDateString(),
                    milesUntilChange,
                    milesPastDue,
                    daysUntilChange,
                    daysOverdue,
                    daysSinceLastChange
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
                        onChange={(e) => setIsDueForMaint(e.target.checked)}
                    />
                    <label> Is Due for Maintenance</label>
                </div>
                <button onClick={onSubmitCar} > Submit New Car </button>

            </div>

            <div className="container table-responsive">
                <table className="table table-hover custom-table">
                    <thead>
                        <tr>
                            <th>Make/Model</th>
                            <th>Mileage</th>
                            <th>Miles per change </th>
                            <th>Miles under/overdue</th>
                            <th>Last change date</th>
                            <th>Days between changes</th>
                            <th>Days until/overdue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {carList.map((car) => (
                            <>
                                <tr>
                                    <td>{`${car.make} ${car.model}`}</td>
                                    <td>{car.mileage}</td>
                                    <td>{car.maintMileageInterval.toLocaleString()}</td>
                                    <td>{car.milesUntilChange > 0 ? (
                                        <div style={{ color: "green" }}>
                                            {car.milesUntilChange.toLocaleString()} miles
                                        </div>
                                    ) : (
                                        <div style={{ color: "red" }}>
                                            {car.milesPastDue.toLocaleString()} miles
                                        </div>
                                    )}
                                    </td>
                                    <td>{car.lastOilChangeDate}</td>
                                    <td>{car.maintIntervalInDays}</td>
                                    <td>{car.daysUntilChange > 0 ? (
                                            <div style={{ color: "green" }}>
                                                 {car.daysUntilChange} days
                                            </div>
                                        ) : (
                                            <div style={{ color: "red" }}>
                                                {car.daysOverdue} days
                                            </div>
                                        )}
                                    </td>
                                    <td></td>
                                </tr>
                            </>
                        ))}

                    </tbody>
                </table>
            </div>
            <div>
                {carList.map((car) => (
                    <div className="container d-flex justify-content-between">
                        <h4 style={{ color: car.isDueForMaint ? "green" : "red" }}>{`${car.make} ${car.model}`}</h4>
                        <h4>Mileage: {car.mileage}</h4>
                        <h4>Miles Between Oil Changes: {car.maintMileageInterval.toLocaleString()} miles</h4>
                        {car.milesUntilChange > 0 ? (
                            <h4 style={{ color: "green" }}>
                                Miles Until Oil Change: {car.milesUntilChange.toLocaleString()} miles
                            </h4>
                        ) : (
                            <h4 style={{ color: "red" }}>
                                Miles Past Oil Change Alert: {car.milesPastDue.toLocaleString()} miles
                            </h4>
                        )}
                        <h4>Last Oil Change Date: {car.lastOilChangeDate}</h4>
                        <h4>Days Between Changes: {car.maintIntervalInDays}</h4>
                        {car.daysUntilChange > 0 ? (
                            <h4 style={{ color: "green" }}>
                                Days Until Oil Change: {car.daysUntilChange} days
                            </h4>
                        ) : (
                            <h4 style={{ color: "red" }}>
                                Days Overdue for Oil Change: {car.daysOverdue} days
                            </h4>
                        )}


                    </div>
                ))}
            </div>

        </div>
    );
};
