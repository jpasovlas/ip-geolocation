import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {isIP} from 'is-ip';


export default function Dashboard({ auth }) {

    const ipInfoApi = import.meta.env.VITE_IP_INFO_API;
    const ipInfoApiKey = import.meta.env.VITE_IP_INFO_API_KEY;
    const [currentIp, setCurrentIp] = useState('');
    const [ipInfo, setIpInfo] = useState('');
    const [ipInfoMap, setIpInfoMap] = useState(null);
    const [formError, setFormError] = useState({});
    const { data, setData, post, processing, reset } = useForm({
        ipAddress: ''
    });

    useEffect(() => {
        const fetchIpInfo = async () => {
            try {
                const response = await fetch(ipInfoApi + '/json' + ipInfoApiKey)
                const ipInfoData = await response.json()
                setIpInfo(ipInfoData)
                setCurrentIp(ipInfoData)
                var coordinates = ipInfoData.loc.split(',')
                setIpInfoMap({ lat: parseFloat(coordinates[0]), lon: parseFloat(coordinates[1])})
                return data;
            } catch (error) {
                console.error('Error fetching IP address:', error)
                return null;
            }
        };

        fetchIpInfo();
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        try {
            if (!isIP(data.ipAddress))
            {
                setFormError({ipAddress: 'Invalid IP address format' });
                return;
            }

            setFormError({});

            const response = await fetch(ipInfoApi + '/' + data.ipAddress + '/geo' + ipInfoApiKey);
            const ipInfoData = await response.json();
            setIpInfo(ipInfoData);
            var coordinates = ipInfoData.loc.split(',')
            setIpInfoMap({ lat: parseFloat(coordinates[0]), lon: parseFloat(coordinates[1])})
            return data;
        } catch (error) {
            console.error('Error fetching IP address:', error);
            return null;
        }
    };

    function UpdateMap({ coordinates }) {
        const map = useMap();
        useEffect(() => {
            if (coordinates) {
                map.setView([coordinates.lat, coordinates.lon], 13);
            }
        }, [coordinates]);
        return null;
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">Your current IP Address: {currentIp.ip}</div>
                        <div className='flex flex-col gap-4 pb-10'>
                            <form className='flex flex-row gap-4 justify-between w-full px-6' onSubmit={submit}>
                                    <TextInput
                                        id="ip"
                                        type="text"
                                        name="text"
                                        value={data.ipAddress}
                                        className="mt-1 block w-full"
                                        autoComplete="ip"
                                        isFocused={true}
                                        onChange={(e) => setData('ipAddress', e.target.value)}
                                        placeholder="IP Address"
                                    />
                                    <PrimaryButton className="ms-4" disabled={processing}>
                                        Find Location
                                    </PrimaryButton>
                            </form>
                            <InputError className='px-6' message={formError.ipAddress} />
                        </div>
                        <div className="text-gray-900 px-6 flex flex-col gap-1 pb-10">
                            {ipInfo && Object.entries(ipInfo).map((item, key) => (
                                <p key={key}>{typeof item[1] === 'string' && item[0].charAt(0).toUpperCase() + item[0].slice(1) + ' : ' + item[1]}</p>
                            ))}
                        </div>
                        <div className='w-full h-full block px-6 pb-10' id="map">
                            {
                                ipInfoMap && <MapContainer center={[ipInfoMap.lat, ipInfoMap.lon]} zoom={13} scrollWheelZoom={false} style={{ height: "50vh", width: "100%" }}>
                                    <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Marker position={[ipInfoMap.lat, ipInfoMap.lon]}>
                                        <Popup>
                                            A pretty CSS3 popup. <br /> Easily customizable.
                                        </Popup>
                                    </Marker>
                                    <UpdateMap coordinates={ipInfoMap} />
                                </MapContainer>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
