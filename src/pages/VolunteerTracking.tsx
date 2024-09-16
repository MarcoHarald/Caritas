import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

interface Volunteer {
  id: string;
  name: string;
  totalHours: number;
}

interface VolunteerSession {
  id: string;
  volunteerId: string;
  date: string;
  hours: number;
}

const VolunteerTracking: React.FC = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [sessions, setSessions] = useState<VolunteerSession[]>([]);
  const [newVolunteer, setNewVolunteer] = useState({ name: '' });
  const [newSession, setNewSession] = useState({ volunteerId: '', date: '', hours: 0 });

  useEffect(() => {
    fetchVolunteers();
    fetchSessions();
  }, []);

  const fetchVolunteers = async () => {
    const q = query(collection(db, 'volunteers'), orderBy('name'));
    const querySnapshot = await getDocs(q);
    const fetchedVolunteers: Volunteer[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Volunteer));
    setVolunteers(fetchedVolunteers);
  };

  const fetchSessions = async () => {
    const q = query(collection(db, 'volunteerSessions'), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    const fetchedSessions: VolunteerSession[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as VolunteerSession));
    setSessions(fetchedSessions);
  };

  const handleAddVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'volunteers'), { ...newVolunteer, totalHours: 0 });
    setNewVolunteer({ name: '' });
    fetchVolunteers();
  };

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    const sessionRef = await addDoc(collection(db, 'volunteerSessions'), newSession);
    const volunteerRef = doc(db, 'volunteers', newSession.volunteerId);
    const volunteer = volunteers.find(v => v.id === newSession.volunteerId);
    if (volunteer) {
      await updateDoc(volunteerRef, {
        totalHours: volunteer.totalHours + newSession.hours
      });
    }
    setNewSession({ volunteerId: '', date: '', hours: 0 });
    fetchVolunteers();
    fetchSessions();
  };

  const handleDeleteSession = async (session: VolunteerSession) => {
    await deleteDoc(doc(db, 'volunteerSessions', session.id));
    const volunteerRef = doc(db, 'volunteers', session.volunteerId);
    const volunteer = volunteers.find(v => v.id === session.volunteerId);
    if (volunteer) {
      await updateDoc(volunteerRef, {
        totalHours: volunteer.totalHours - session.hours
      });
    }
    fetchVolunteers();
    fetchSessions();
  };

  return (
    <div className="volunteer-tracking">
      <h1 className="text-2xl font-bold mb-4">Volunteer Tracking</h1>
      
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">Add New Volunteer</h2>
          <form onSubmit={handleAddVolunteer} className="mb-4">
            <input
              type="text"
              value={newVolunteer.name}
              onChange={(e) => setNewVolunteer({ name: e.target.value })}
              placeholder="Volunteer Name"
              required
              className="p-2 border rounded mr-2"
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
              Add Volunteer
            </button>
          </form>

          <h2 className="text-xl font-semibold mb-2">Volunteers</h2>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Name</th>
                <th className="text-left">Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {volunteers.map((volunteer) => (
                <tr key={volunteer.id}>
                  <td>{volunteer.name}</td>
                  <td>{volunteer.totalHours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Add Volunteer Session</h2>
          <form onSubmit={handleAddSession} className="mb-4">
            <select
              value={newSession.volunteerId}
              onChange={(e) => setNewSession({ ...newSession, volunteerId: e.target.value })}
              required
              className="p-2 border rounded mr-2"
            >
              <option value="">Select Volunteer</option>
              {volunteers.map((volunteer) => (
                <option key={volunteer.id} value={volunteer.id}>{volunteer.name}</option>
              ))}
            </select>
            <input
              type="date"
              value={newSession.date}
              onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
              required
              className="p-2 border rounded mr-2"
            />
            <input
              type="number"
              value={newSession.hours}
              onChange={(e) => setNewSession({ ...newSession, hours: Number(e.target.value) })}
              placeholder="Hours"
              required
              className="p-2 border rounded mr-2"
            />
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
              Add Session
            </button>
          </form>

          <h2 className="text-xl font-semibold mb-2">Recent Sessions</h2>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Volunteer</th>
                <th className="text-left">Date</th>
                <th className="text-left">Hours</th>
                <th className="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td>{volunteers.find(v => v.id === session.volunteerId)?.name}</td>
                  <td>{session.date}</td>
                  <td>{session.hours}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteSession(session)}
                      className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VolunteerTracking;