import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

interface DisposedTrashItem {
  id: string;
  date: string;
  blueBags: number;
  yellowBags: number;
  tripsToLandfill: number;
  notes: string;
}

const DisposedTrash: React.FC = () => {
  const [items, setItems] = useState<DisposedTrashItem[]>([]);
  const [newItem, setNewItem] = useState<Omit<DisposedTrashItem, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    blueBags: 0,
    yellowBags: 0,
    tripsToLandfill: 0,
    notes: '',
  });
  const [editingItem, setEditingItem] = useState<DisposedTrashItem | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const q = query(collection(db, 'disposedTrash'), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    const fetchedItems: DisposedTrashItem[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DisposedTrashItem));
    setItems(fetchedItems);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: name === 'date' ? value : parseInt(value) || 0 }));
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditingItem(prev => prev ? { ...prev, [name]: name === 'date' ? value : parseInt(value) || 0 } : null);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'disposedTrash'), newItem);
    setNewItem({
      date: new Date().toISOString().split('T')[0],
      blueBags: 0,
      yellowBags: 0,
      tripsToLandfill: 0,
      notes: '',
    });
    fetchItems();
  };

  const handleEditItem = (item: DisposedTrashItem) => {
    setEditingItem(item);
  };

  const handleSaveEdit = async () => {
    if (editingItem) {
      const itemRef = doc(db, 'disposedTrash', editingItem.id);
      await updateDoc(itemRef, {
        date: editingItem.date,
        blueBags: editingItem.blueBags,
        yellowBags: editingItem.yellowBags,
        tripsToLandfill: editingItem.tripsToLandfill,
        notes: editingItem.notes,
      });
      setEditingItem(null);
      fetchItems();
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      await deleteDoc(doc(db, 'disposedTrash', id));
      fetchItems();
    }
  };

  return (
    <div className="disposed-trash-page">
      <h1 className="text-2xl font-bold mb-4">Disposed Trash Tracker</h1>
      
      <form onSubmit={handleAddItem} className="mb-6 bg-gray-100 p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="date"
              name="date"
              value={newItem.date}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="relative">
            <input
              type="number"
              name="blueBags"
              value={newItem.blueBags}
              onChange={handleInputChange}
              required
              className="w-full p-2 pl-24 border rounded bg-transparent"
            />
            <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-400 pointer-events-none">
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Blue Bags
            </span>
          </div>
          <div className="relative">
            <input
              type="number"
              name="yellowBags"
              value={newItem.yellowBags}
              onChange={handleInputChange}
              required
              className="w-full p-2 pl-28 border rounded bg-transparent"
            />
            <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-400 pointer-events-none">
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Yellow Bags
            </span>
          </div>
          <div className="relative">
            <input
              type="number"
              name="tripsToLandfill"
              value={newItem.tripsToLandfill}
              onChange={handleInputChange}
              required
              className="w-full p-2 pl-36 border rounded bg-transparent"
            />
            <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-400 pointer-events-none">
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Trips to Landfill
            </span>
          </div>
          <div className="col-span-2">
            <textarea
              name="notes"
              value={newItem.notes}
              onChange={handleInputChange}
              placeholder="Notes (optional)"
              className="w-full p-2 border rounded"
              rows={4}
            />
          </div>
        </div>
        <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded w-full">
          Add Disposed Trash Record
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-4">Disposed Trash Records</h2>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left">Date</th>
            <th className="text-left">Blue Bags</th>
            <th className="text-left">Yellow Bags</th>
            <th className="text-left">Trips to Landfill</th>
            <th className="text-left">Notes</th>
            <th className="text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              {editingItem && editingItem.id === item.id ? (
                <>
                  <td>
                    <input
                      type="date"
                      name="date"
                      value={editingItem.date}
                      onChange={handleEditInputChange}
                      className="w-full p-1 border rounded"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="blueBags"
                      value={editingItem.blueBags}
                      onChange={handleEditInputChange}
                      className="w-full p-1 border rounded"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="yellowBags"
                      value={editingItem.yellowBags}
                      onChange={handleEditInputChange}
                      className="w-full p-1 border rounded"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="tripsToLandfill"
                      value={editingItem.tripsToLandfill}
                      onChange={handleEditInputChange}
                      className="w-full p-1 border rounded"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="notes"
                      value={editingItem.notes}
                      onChange={handleEditInputChange}
                      className="w-full p-1 border rounded"
                    />
                  </td>
                  <td>
                    <button onClick={handleSaveEdit} className="bg-blue-500 text-white px-2 py-1 rounded mr-2">
                      Save
                    </button>
                    <button onClick={handleCancelEdit} className="bg-gray-300 text-gray-800 px-2 py-1 rounded mr-2">
                      Cancel
                    </button>
                    <button onClick={() => handleDeleteItem(item.id)} className="bg-red-500 text-white px-2 py-1 rounded">
                      Delete
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td>{item.date}</td>
                  <td>{item.blueBags}</td>
                  <td>{item.yellowBags}</td>
                  <td>{item.tripsToLandfill}</td>
                  <td>{item.notes}</td>
                  <td>
                    <button
                      onClick={() => handleEditItem(item)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DisposedTrash;