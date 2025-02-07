import React from 'react';
import { useEffect, useState } from 'react';
import { Timestamp } from "firebase/firestore";
import { db, auth, storage } from '../config/firebase.js';
import { getDocs, collection, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';



export const UserDashboard = () => {
    const [carList, setCarList] = useState([]);

    // New Car States
    const [make, setMake] = useState("")
    const [model, setModel] = useState("")
    const [mileage, setMileage] = useState(0)
    const [lastOilChangeMileage, setLastOilChangeMileage] = useState(0)
    const [maintMileageInterval, setMaintMileageInterval] = useState(0)
    const [lastOilChangeDate, setLastOilChangeDate] = useState()
    const [maintIntervalInDays, setMaintIntervalInDays] = useState("")
    const [isDueForMaint, setIsDueForMaint] = useState(false)

    // Edit Car State
    const [editMileage, setEditMileage] = useState(0)

    // File Upload State
    const [fileUpload, setFileUpload] = useState(null)

    const carsCollectionRef = collection(db, "Cars")

    useEffect(() => {
        getCarList()
    }, [getCarList])

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
                isDueForMaint: isDueForMaint,
                userId: auth?.currentUser.uid,
            })
            getCarList()
        } catch (err) {
            console.error(err)
        }
    }

    const deleteCar = async (id) => {
        const carDoc = doc(db, "Cars", id)
        await deleteDoc(carDoc)
        getCarList()
    }

    const updateMileage = async (id) => {
        const carDoc = doc(db, "Cars", id);
        await updateDoc(carDoc, { mileage: editMileage })
        getCarList()
        setEditMileage("")
    }

    const uploadFile = async () => {
        if (!fileUpload) return;
        const filesFolderRef = ref(storage, `projectPictures/${fileUpload.name}`);
        try {
            await uploadBytes(filesFolderRef, fileUpload);
        } catch (err) {
            console.error(err)
        }




    }

    return (
        <div className="text-center mt-5">
            <h1>Hello World Firebase!!</h1>
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
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {carList.map((car) => (
                            <tr key={car.id}>
                                <td>{`${car.make} ${car.model}`}</td>
                                <td>
                                    <div>
                                        <div>
                                            {car.mileage}
                                        </div>
                                        <div>
                                            <input
                                                placeholder="New Mileage..."
                                                onChange={((e) => setEditMileage(Number(e.target.value)))}
                                            />
                                        </div>
                                    </div>
                                </td>
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
                                <td>
                                    <div className="d-flex justify-content-between">
                                        <button onClick={() => updateMileage(car.id)} className="border-0 bg-white">
                                            <i className="fas fa-pencil-alt"></i>
                                        </button>
                                        <button onClick={() => deleteCar(car.id)} className="border-0 bg-white">
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                    </tbody>
                </table>
            </div>
            <div>
                <input type="file" onChange={(e) => setFileUpload(e.target.files[0])} />
                <button onClick={uploadFile}> Upload File </button>

            </div>

            {/* <div>
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
            </div> */}

        </div>
    );
};
