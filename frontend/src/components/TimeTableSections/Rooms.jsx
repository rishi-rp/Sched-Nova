import { useEffect, useState } from 'react';
import { Plus, Trash2, Building, DoorOpen, Edit2, Check, X, Building2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../Api/api';

const Rooms = () => {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [showGroupInput, setShowGroupInput] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const { timetableId } = useParams();
  const navigate = useNavigate();

  const canSave =
  groups.length > 0 &&
  groups.every(g => g.rooms.length > 0) &&
  !error &&
  isDirty;



  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(
          `/timetables/${timetableId}/rooms`
        );

        if (res.data.length === 0) {
          setGroups([]);
          setIsDirty(false);
          return;
        }

        const groupMap = new Map();

        res.data.forEach(room => {
          const groupName = room.room_group;

          if (!groupMap.has(groupName)) {
            groupMap.set(groupName, {
              id: groupName,
              name: groupName,
              rooms: []
            });
          }

          groupMap.get(groupName).rooms.push({
            id: room.id,
            building: room.building,
            name: room.name,
            displayName: `${room.building}-${groupName}-${room.name}`
          });
        });

        setGroups(Array.from(groupMap.values()));
        setIsDirty(false);
      } catch (e) {
        setError("Failed to load rooms");
      }
    };

    load();
  }, [timetableId]);


  useEffect(() => {
    const handler = (e) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);



  // Add new room group
  const addGroup = () => {
    if (!newGroupName.trim()) {
      setError('Group name cannot be empty');
      return;
    }
    if (newGroupName.length > 100) {
      setError('Group name must be under 100 characters');
      return;
    }
    if (groups.some(g => g.name.toLowerCase() === newGroupName.toLowerCase())) {
      setError('A group with this name already exists');
      return;
    }

    setGroups([...groups, { id: Date.now(), name: newGroupName, rooms: [] }]);
    setIsDirty(true);
    setNewGroupName('');
    setShowGroupInput(false);
    setError('');
  };

  // Delete group
  const deleteGroup = (groupId) => {
    setGroups(groups.filter(g => g.id !== groupId));
    setIsDirty(true);
  };

  // Start editing group name
  const startEditGroup = (group) => {
    setEditingGroup(group.id);
    setEditGroupName(group.name);

    setIsDirty(true);
  };

  // Save edited group name
  const saveEditGroup = (groupId) => {
    if (!editGroupName.trim()) {
      setError('Group name cannot be empty');
      return;
    }
    if (groups.some(g => g.id !== groupId && g.name.toLowerCase() === editGroupName.toLowerCase())) {
      setError('A group with this name already exists');
      return;
    }

    setGroups(groups.map(g => {
      if (g.id === groupId) {
        // Update all room display names with the new group name
        const updatedRooms = g.rooms.map(room => ({
          ...room,
          displayName: `${room.building}-${editGroupName}-${room.name}`
        }));
        return { ...g, name: editGroupName, rooms: updatedRooms };
      }
      return g;
    }));
    setEditingGroup(null);
    setIsDirty(true);
    setError('');
  };

  // Add room to group
  const addRoom = (groupId, building, roomName) => {
    const group = groups.find(g => g.id === groupId);
    const displayName = `${building}-${group.name}-${roomName}`;
    
    // Check for duplicate display names across all groups
    const isDuplicate = groups.some(g => 
      g.rooms.some(r => r.displayName === displayName)
    );

    if (isDuplicate) {
      return 'A room with this display name already exists';
    }

    const newRoom = {
      id: Date.now(),
      building,
      name: roomName,
      displayName
    };
    setIsDirty(true);

    setGroups(groups.map(g => 
      g.id === groupId ? { ...g, rooms: [...g.rooms, newRoom] } : g
    ));

    return null;
  };

  // Delete room
  const deleteRoom = (groupId, roomId) => {
    setGroups(groups.map(g => 
      g.id === groupId ? { ...g, rooms: g.rooms.filter(r => r.id !== roomId) } : g
    ));
    setIsDirty(true);
  };


  const handleSave = async () => {
    if(!canSave) return;
    setError("");

    // 1️⃣ Validate groups
    const emptyGroups = groups.filter(g => g.rooms.length === 0);
    if (emptyGroups.length > 0) {
      setError("Each room group must contain at least one room.");
      return;
    }

    // 2️⃣ Build atomic payload
    const payload = groups.flatMap(group =>
      group.rooms.map(room => ({
        timetable_id: Number(timetableId),
        name: room.name,
        building: room.building,
        room_group: group.name
      }))
    );

    try {
      await api.put("/rooms/bulk", payload);
      setIsDirty(false);
      alert("✅ Rooms saved successfully");
      navigate(`/timetables/${timetableId}`)
    } catch (err) {
      const detail = err.response?.data?.detail;

      if (typeof detail === "string") {
        setError(detail);
      } else {
        setError("Failed to save rooms");
      }
    } finally {
      setLoading(false);
  }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 font-['Segoe_UI',sans-serif]">
        
      {/* Hero Section */}
      <section className="relative bg-[#9333ea] px-8 py-14">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-4 text-white">
            <Building2 className="w-4 h-4 text-[#FFD166]" />
              Venue Configuration
          </div>
          
          <h1 className="text-[48px] font-extrabold text-white tracking-[1px] mb-3">
            Room <span className="text-[#FFD166]">Management</span>
          </h1>
          
          <p className="text-[17px] text-[#e5edff] leading-[1.6] max-w-[800px]">
            Organize your physical spaces by creating room groups and defining individual venues. Each room is uniquely identified by building, group, and name.
          </p>

          <div className="flex gap-6 mt-6 text-white">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-[#FFD166]" />
              <span>{groups.length} Groups</span>
            </div>
            <div className="flex items-center gap-2">
              <DoorOpen className="w-5 h-5 text-[#FFD166]" />
              <span>{groups.reduce((sum, g) => sum + g.rooms.length, 0)} Rooms</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-[60px] px-6 bg-[rgb(244,238,245)]">
        <div className="max-w-[1200px] mx-auto">
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Add Group Button */}
          <div className="mb-8">
            {!showGroupInput ? (
              <button
                onClick={() => setShowGroupInput(true)}
                className="px-6 py-3 bg-[#9333ea] text-white rounded-xl font-semibold shadow-lg hover:bg-[#7c2dc4] hover:-translate-y-1 transition-all duration-200 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Room Group
              </button>
            ) : (
              <div className="flex gap-3 items-center bg-white p-4 rounded-xl shadow-lg max-w-md">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addGroup()}
                  placeholder="Enter group name (e.g., Lab, Lecture Hall)"
                  className="flex-1 px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-600 focus:outline-none"
                  maxLength={100}
                  autoFocus
                />
                <button
                  onClick={addGroup}
                  className="px-4 py-2 bg-[#FFD166] text-black rounded-lg hover:scale-105 transition-colors"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setShowGroupInput(false);
                    setNewGroupName('');
                    setError('');
                  }}
                  className="px-4 py-2 rounded-lg flex items-center justify-center bg-slate-100 text-slate-500
                    hover:bg-red-100 hover:text-red-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Groups List */}
          {groups.length === 0 ? (
            <div className="text-center py-20">
              <Building className="w-16 h-16 text-purple-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Room Groups Yet</h3>
              <p className="text-gray-500">Create your first room group to get started</p>
            </div>
          ) : (
            <div className="space-y-6">
              {groups.map((group) => (
                <RoomGroup
                  key={group.id}
                  group={group}
                  onDelete={deleteGroup}
                  onAddRoom={addRoom}
                  onDeleteRoom={deleteRoom}
                  isEditing={editingGroup === group.id}
                  editName={editGroupName}
                  onEditNameChange={setEditGroupName}
                  onStartEdit={startEditGroup}
                  onSaveEdit={saveEditGroup}
                  onCancelEdit={() => setEditingGroup(null)}
                />
              ))}
            </div>
          )}
          <div className="mt-12 flex justify-end">
            <button
              disabled={!canSave || loading}
              onClick={handleSave}
              className="px-6 py-3 bg-[#9333ea] text-white rounded-xl font-semibold
                shadow-lg hover:bg-[#7c2dc4]
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

// Room Group Component
const RoomGroup = ({ 
  group, 
  onDelete, 
  onAddRoom, 
  onDeleteRoom,
  isEditing,
  editName,
  onEditNameChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit
}) => {
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [building, setBuilding] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomError, setRoomError] = useState('');

  const handleAddRoom = () => {
    if (!building.trim() || !roomName.trim()) {
      setRoomError('Both building and room name are required');
      return;
    }

    if (building.length > 100 || roomName.length > 100) {
      setRoomError('Building and room name must be under 100 characters');
      return;
    }

    const error = onAddRoom(group.id, building.trim(), roomName.trim());
    if (error) {
      setRoomError(error);
      return;
    }

    setBuilding('');
    setRoomName('');
    setShowRoomForm(false);
    setRoomError('');
  };


  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-purple-100">
      {/* Group Header */}
      <div className="bg-[#9333ea] p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Building className="w-6 h-6" />
            </div>
            
            {isEditing ? (
              <div className="flex gap-2 items-center flex-1">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => onEditNameChange(e.target.value)}
                  className="px-3 py-2
                            bg-white
                            border border-slate-300
                            rounded-md
                            text-sm text-slate-800
                            focus:border-purple-500
                            focus:ring-2 focus:ring-purple-200
                            outline-none"
                  maxLength={100}
                  autoFocus
                />
                <button
                  onClick={() => onSaveEdit(group.id)}
                  className="w-9 h-9 flex items-center justify-center
                            bg-purple-50 border border-purple-200 rounded-md
                            text-purple-700 hover:bg-purple-100
                            transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={onCancelEdit}
                  className="w-9 h-9 flex items-center justify-center
                            bg-slate-50 border border-slate-200 rounded-md
                            text-slate-600 hover:bg-slate-100
                            transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div>
                  <h2 className="text-2xl font-bold">{group.name}</h2>
                  <p className="text-purple-100 text-sm">{group.rooms.length} rooms</p>
                </div>
                <button
                  onClick={() => onStartEdit(group)}
                  className="ml-3 p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          
          <button
            onClick={() => onDelete(group.id)}
            className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#FFD166] text-black
                    hover:bg-red-100 hover:text-red-600 transition-colors
                    disabled:opacity-40"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Rooms List */}
      <div className="p-6">
        {roomError && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded">
            <p className="text-red-700 text-sm">{roomError}</p>
          </div>
        )}

        {group.rooms.length === 0 && !showRoomForm && (
          <p className="text-gray-400 text-center py-4">No rooms added yet</p>
        )}

        {/* Rooms Grid */}
        {group.rooms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {group.rooms.map((room) => (
              <div
                key={room.id}
                className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-200 hover:shadow-md group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <DoorOpen className="w-4 h-4 text-purple-600" />
                      <span className="font-bold text-purple-900">{room.displayName}</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Building: <span className="font-medium">{room.building}</span></p>
                      <p>Room: <span className="font-medium">{room.name}</span></p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onDeleteRoom(group.id, room.id)}
                    className="p-2 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Room Form */}
        {showRoomForm ? (
          <div className="bg-purple-50 p-5 rounded-xl border-2 border-purple-200">
            <h3 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Room
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Building Name
                </label>
                <input
                  type="text"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  placeholder="e.g., B, Maple, Engineering"
                  className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-600 focus:outline-none"
                  maxLength={100}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Name
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g., 101, Conference, Lab-A"
                  className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-600 focus:outline-none"
                  maxLength={100}
                />
              </div>
            </div>

            {building && roomName && (
              <div className="mb-4 p-3 bg-purple-100 rounded-lg">
                <p className="text-sm text-purple-700">
                  Display Name: <span className="font-bold">{building}-{group.name}-{roomName}</span>
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleAddRoom}
                className="px-5 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Add Room
              </button>
              <button
                onClick={() => {
                  setShowRoomForm(false);
                  setBuilding('');
                  setRoomName('');
                  setRoomError('');
                }}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowRoomForm(true)}
            className="w-full py-3 border-2 border-dashed border-purple-300 rounded-xl text-purple-600 font-semibold hover:bg-purple-50 hover:border-purple-400 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Room to {group.name}
          </button>
        )}
      </div>
    </div>
  );
};

export default Rooms;