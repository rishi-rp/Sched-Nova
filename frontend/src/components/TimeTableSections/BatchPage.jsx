import { useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Users,
  UserPlus,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Folder,
  Grid3x3,
  ChevronDown,
  ChevronRight
} from "lucide-react";

const BatchPage = () => {
  const [batches, setBatches] = useState([]);
  const [groupTypes, setGroupTypes] = useState([]); // Each has: id, name, maxBatches, instances: [{ id, name, assignedBatches: [] }]
  const [bulkInput, setBulkInput] = useState("");
  const [singleBatch, setSingleBatch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Group Type form
  const [groupTypeName, setGroupTypeName] = useState("");
  const [groupTypeCount, setGroupTypeCount] = useState("");
  
  // Group Instance management
  const [assigningInstance, setAssigningInstance] = useState(null); // { groupTypeId, instanceId }
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [expandedGroupTypes, setExpandedGroupTypes] = useState([]);

  // Add batches from comma-separated input
  const handleBulkAdd = () => {
    setError("");
    setSuccess("");

    if (!bulkInput.trim()) {
      setError("Please enter at least one batch name");
      return;
    }

    const names = bulkInput
      .split(",")
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (names.length === 0) {
      setError("No valid batch names found");
      return;
    }

    // Check for duplicates with existing batches
    const duplicates = names.filter((name) =>
      batches.some((b) => b.name.toLowerCase() === name.toLowerCase())
    );

    if (duplicates.length > 0) {
      setError(`Batch(es) already exist: ${duplicates.join(", ")}`);
      return;
    }

    const newBatches = names.map((name) => ({
      id: `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name
    }));

    setBatches([...batches, ...newBatches]);
    setBulkInput("");
    setSuccess(`Added ${names.length} ${names.length === 1 ? "batch" : "batches"} successfully`);
  };

  // Add single batch
  const handleSingleAdd = () => {
    setError("");
    setSuccess("");

    if (!singleBatch.trim()) {
      setError("Please enter a batch name");
      return;
    }

    // Check for duplicate
    if (batches.some((b) => b.name.toLowerCase() === singleBatch.trim().toLowerCase())) {
      setError(`Batch "${singleBatch}" already exists`);
      return;
    }

    const newBatch = {
      id: `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: singleBatch.trim()
    };

    setBatches([...batches, newBatch]);
    setSingleBatch("");
    setSuccess("Batch added successfully");
  };

  // Add Group Type
  const handleAddGroupType = () => {
    setError("");
    setSuccess("");

    if (!groupTypeName.trim()) {
      setError("Please enter a group type name");
      return;
    }

    if (!groupTypeCount || parseInt(groupTypeCount) <= 0) {
      setError("Please enter a valid number of batches");
      return;
    }

    // Check for duplicate group type name
    if (groupTypes.some((gt) => gt.name.toLowerCase() === groupTypeName.trim().toLowerCase())) {
      setError(`Group type "${groupTypeName}" already exists`);
      return;
    }

    const newGroupType = {
      id: `GT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: groupTypeName.trim(),
      maxBatches: parseInt(groupTypeCount),
      instances: [] // Will store individual group instances
    };

    setGroupTypes([...groupTypes, newGroupType]);
    setExpandedGroupTypes([...expandedGroupTypes, newGroupType.id]);
    setGroupTypeName("");
    setGroupTypeCount("");
    setSuccess(`Group type "${newGroupType.name}" created successfully`);
  };

  const sortInstancesByNumber = (instances) => {
    return [...instances].sort((a, b) => {
      const aNum = parseInt(a.name.match(/(\d+)$/)?.[1] || 0, 10);
      const bNum = parseInt(b.name.match(/(\d+)$/)?.[1] || 0, 10);
      return aNum - bNum;
    });
  };

  const getNextInstanceNumber = (instances) => {
    const usedNumbers = instances
      .map((inst) => {
        const match = inst.name.match(/(\d+)$/);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter((n) => n !== null)
      .sort((a, b) => a - b);

    let next = 1;
    for (const num of usedNumbers) {
      if (num === next) next++;
      else break;
    }
    return next;
  };

  // Add Group Instance to a Group Type
  const addGroupInstance = (groupTypeId) => {
    const groupType = groupTypes.find((gt) => gt.id === groupTypeId);
    const instanceNumber = getNextInstanceNumber(groupType.instances);
    
    const newInstance = {
      id: `INST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${groupType.name} ${instanceNumber}`,
      assignedBatches: []
    };

    setGroupTypes(
      groupTypes.map((gt) =>
      {
        if (gt.id !== groupTypeId) return gt;

        const updatedInstances = sortInstancesByNumber([
          ...gt.instances,
          newInstance
        ]);

        return {
          ...gt,
          instances: updatedInstances
        };
      }
      )
    );
    
    setSuccess(`Added ${newInstance.name}`);
  };

  // Delete Group Type
  const deleteGroupType = (id) => {
    setGroupTypes(groupTypes.filter((gt) => gt.id !== id));
    setExpandedGroupTypes(expandedGroupTypes.filter((gtId) => gtId !== id));
    setSuccess("Group type deleted successfully");
    if (assigningInstance?.groupTypeId === id) {
      setAssigningInstance(null);
      setSelectedBatches([]);
    }
  };

  // Delete Group Instance
  const deleteGroupInstance = (groupTypeId, instanceId) => {
    setGroupTypes(
      groupTypes.map((gt) =>
        gt.id === groupTypeId
          ? { ...gt, instances: gt.instances.filter((inst) => inst.id !== instanceId) }
          : gt
      )
    );
    
    setSuccess("Group instance deleted successfully");
    
    if (assigningInstance?.instanceId === instanceId) {
      setAssigningInstance(null);
      setSelectedBatches([]);
    }
  };

  // Toggle group type expansion
  const toggleGroupType = (groupTypeId) => {
    if (expandedGroupTypes.includes(groupTypeId)) {
      setExpandedGroupTypes(expandedGroupTypes.filter((id) => id !== groupTypeId));
    } else {
      setExpandedGroupTypes([...expandedGroupTypes, groupTypeId]);
    }
  };

  // Start assigning batches to a group instance
  const startAssigning = (groupTypeId, instance) => {
    setAssigningInstance({ groupTypeId, instanceId: instance.id });
    setSelectedBatches(instance.assignedBatches);
    setError("");
    setSuccess("");
  };

  // Cancel assigning
  const cancelAssigning = () => {
    setAssigningInstance(null);
    setSelectedBatches([]);
    setError("");
  };

  // Check if a batch is already used in another instance of the SAME group type
  const isBatchUsedInSameGroupType = (batchId, groupTypeId, currentInstanceId) => {
    const groupType = groupTypes.find((gt) => gt.id === groupTypeId);
    if (!groupType) return false;

    return groupType.instances.some(
      (inst) => inst.id !== currentInstanceId && inst.assignedBatches.includes(batchId)
    );
  };

  // Get the instance name where a batch is used in the same group type
  const getUsedInInstanceName = (batchId, groupTypeId, currentInstanceId) => {
    const groupType = groupTypes.find((gt) => gt.id === groupTypeId);
    if (!groupType) return null;

    const instance = groupType.instances.find(
      (inst) => inst.id !== currentInstanceId && inst.assignedBatches.includes(batchId)
    );
    
    return instance ? instance.name : null;
  };

  // Toggle batch selection
  const toggleBatchSelection = (batchId) => {
    if (selectedBatches.includes(batchId)) {
      setSelectedBatches(selectedBatches.filter((id) => id !== batchId));
      setError("");
    } else {
      const groupType = groupTypes.find((gt) => gt.id === assigningInstance.groupTypeId);
      
      if (selectedBatches.length >= groupType.maxBatches) {
        setError(`Cannot add more than ${groupType.maxBatches} batches to this group`);
        return;
      }
      
      setSelectedBatches([...selectedBatches, batchId]);
      setError("");
    }
  };

  // Save batch assignments
  const saveAssignments = () => {
    const groupType = groupTypes.find(
      (gt) => gt.id === assigningInstance.groupTypeId
    );

    if (selectedBatches.length !== groupType.maxBatches) {
      setError(
        `This group requires exactly ${groupType.maxBatches} batches`
      );
      return;
    }

    setGroupTypes(
      groupTypes.map((gt) =>
        gt.id === assigningInstance.groupTypeId
          ? {
              ...gt,
              instances: gt.instances.map((inst) =>
                inst.id === assigningInstance.instanceId
                  ? { ...inst, assignedBatches: selectedBatches }
                  : inst
              )
            }
          : gt
      )
    );
    
    setSuccess("Batch assignments saved successfully");
    cancelAssigning();
  };

  // Get all group assignments for a batch
  const getBatchAssignments = (batchId) => {
    const assignments = [];
    
    groupTypes.forEach((groupType) => {
      groupType.instances.forEach((instance) => {
        if (instance.assignedBatches.includes(batchId)) {
          assignments.push(instance.name);
        }
      });
    });
    
    return assignments;
  };

  // Delete batch
  const deleteBatch = (id) => {
    // Check if batch is assigned to any group instance
    const assignments = getBatchAssignments(id);
    
    if (assignments.length > 0) {
      setError(
        `Cannot delete batch. It's assigned to: ${assignments.join(", ")}`
      );
      return;
    }

    setBatches(batches.filter((b) => b.id !== id));
    setSuccess("Batch deleted successfully");
  };

  return (
    <main className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 min-h-screen font-sans text-slate-800">
      {/* HERO */}
      <section className="relative bg-[#9333ea] px-8 py-14">
        <div className="max-w-7xl mx-auto text-white">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-6 text-sm">
            <Sparkles className="w-4 h-4 text-[#FFD166]" />
            Batch Management
          </div>

          <h1 className="text-5xl font-bold tracking-tight mb-3">
            Student <span className="text-[#FFD166]">Batches</span>
          </h1>

          <p className="text-purple-100 text-base max-w-2xl leading-relaxed">
            Organize students into batches and create custom group types for flexible academic structuring.
          </p>

          <div className="flex gap-8 mt-8 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#FFD166]" />
              {batches.length} {batches.length === 1 ? "Batch" : "Batches"}
            </div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#FFD166]" />
              {groupTypes.length} Group {groupTypes.length === 1 ? "Type" : "Types"}
            </div>
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-[#FFD166]" />
              {groupTypes.reduce((sum, gt) => sum + gt.instances.length, 0)} Total Groups
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="max-w-7xl mx-auto px-8 py-12 -mt-8">
        {/* MESSAGES */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg border border-red-400 bg-red-50/70 backdrop-blur-sm text-sm text-red-700 font-medium shadow-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 px-4 py-3 rounded-lg border border-green-400 bg-green-50/70 backdrop-blur-sm text-sm text-green-700 font-medium shadow-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN - BATCHES */}
          <div className="bg-white rounded-3xl shadow-xl p-10">
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-6">
              <UserPlus className="w-5 h-5 text-purple-600" />
              Add Batches
            </h2>

            {/* Bulk Add */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Add Multiple (comma-separated)
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder="e.g., B1, B2, B3, B4"
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                  onKeyDown={(e) => e.key === "Enter" && handleBulkAdd()}
                />
                <button
                  onClick={handleBulkAdd}
                  className="px-6 py-3 bg-[#9333ea] text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add All
                </button>
              </div>
            </div>
            

            {/* DIVIDER */}
            <div className="relative my-8">
              <div className="h-px bg-slate-200" />
              <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-4 text-xs font-semibold text-slate-400">
                BATCH LIST
              </span>
            </div>

            {/* Batch List */}
            {batches.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No Batches Added Yet</h3>
                <p className="text-sm text-slate-500">Start by adding batches using the form above</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {batches.map((batch) => {
                  const assignments = getBatchAssignments(batch.id);

                  return (
                    <div
                      key={batch.id}
                      className="flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 hover:border-purple-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">
                          {batch.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{batch.name}</div>
                          {assignments.length > 0 && (
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Layers className="w-3 h-3" />
                              {assignments.join(", ")}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteBatch(batch.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - GROUP TYPES */}
          <div className="bg-white rounded-3xl shadow-xl p-10">
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-6">
              <Folder className="w-5 h-5 text-purple-600" />
              Group Types
            </h2>

            {/* Add Group Type */}
            <div className="mb-8">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Group Type Name
                  </label>
                  <input
                    type="text"
                    value={groupTypeName}
                    onChange={(e) => setGroupTypeName(e.target.value)}
                    placeholder="e.g., Group, Section"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    No. of Batches
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={groupTypeCount}
                    onChange={(e) => setGroupTypeCount(e.target.value)}
                    placeholder="e.g., 4"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                  />
                </div>
              </div>
              <button
                onClick={handleAddGroupType}
                className="w-full px-6 py-3 bg-[#9333ea] text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Create Group Type
              </button>
            </div>

            {/* DIVIDER */}
            <div className="relative my-8">
              <div className="h-px bg-slate-200" />
              <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-4 text-xs font-semibold text-slate-400">
                GROUP TYPES
              </span>
            </div>

            {/* Group Types List */}
            {groupTypes.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                  <Layers className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No Group Types Yet</h3>
                <p className="text-sm text-slate-500">Create group types to organize batches</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {groupTypes.map((groupType) => {
                  const isExpanded = expandedGroupTypes.includes(groupType.id);

                  return (
                    <div
                      key={groupType.id}
                      className="border-2 border-slate-200 rounded-xl overflow-hidden hover:border-purple-300 transition-colors"
                    >
                      {/* Group Type Header */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <button
                            onClick={() => toggleGroupType(groupType.id)}
                            className="text-slate-600 hover:text-purple-600 transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5" />
                            ) : (
                              <ChevronRight className="w-5 h-5" />
                            )}
                          </button>
                          <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center text-white">
                            <Grid3x3 className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800">{groupType.name}</h3>
                            <p className="text-xs text-slate-500">
                              {groupType.maxBatches} batches per group • {groupType.instances.length} groups created
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => addGroupInstance(groupType.id)}
                            className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1 text-sm"
                          >
                            <Plus size={14} />
                            Add Group
                          </button>
                          <button
                            onClick={() => deleteGroupType(groupType.id)}
                            className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Group Instances */}
                      {isExpanded && (
                        <div className="p-4 bg-white space-y-3">
                          {groupType.instances.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-4">
                              No groups created yet. Click "Add Group" to create one.
                            </p>
                          ) : (
                            groupType.instances.map((instance) => {
                              const isAssigning =
                                assigningInstance?.instanceId === instance.id;

                              return (
                                <div
                                  key={instance.id}
                                  className="border border-slate-200 rounded-lg overflow-hidden"
                                >
                                  {/* Instance Header */}
                                  <div className="bg-slate-50 px-4 py-2 flex items-center justify-between">
                                    <div>
                                      <h4 className="font-medium text-slate-800">
                                        {instance.name}
                                      </h4>
                                      <p className="text-xs text-slate-500">
                                        {instance.assignedBatches.length} / {groupType.maxBatches} batches
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      {isAssigning ? (
                                        <>
                                          <button
                                            onClick={saveAssignments}
                                            className="px-3 py-1.5
                                                      bg-green-500/10
                                                      text-black
                                                      border border-green-400/40
                                                      backdrop-blur-md
                                                      rounded-lg
                                                      hover:bg-green-500/30
                                                      hover:border-green-300/100
                                                      transition-all
                                                      flex items-center gap-1
                                                      text-xs"
                                          >
                                            <Save size={12} />
                                            Save
                                          </button>
                                          <button
                                            onClick={cancelAssigning}
                                            className="px-3 py-1.5 rounded-lg flex items-center justify-center bg-slate-100 text-slate-500
                                                        hover:bg-red-100 hover:text-red-600"
                                          >
                                            <X size={12} />
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          <button
                                            onClick={() =>
                                              startAssigning(groupType.id, instance)
                                            }
                                            className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-1 text-xs"
                                          >
                                            <Edit2 size={12} />
                                            Assign
                                          </button>
                                          <button
                                            onClick={() =>
                                              deleteGroupInstance(groupType.id, instance.id)
                                            }
                                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs"
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  {/* Instance Content */}
                                  {isAssigning ? (
                                    <div className="p-3 bg-white">
                                      <p className="text-xs text-slate-600 mb-2 font-medium">
                                        Select up to {groupType.maxBatches} batches:
                                      </p>
                                      {batches.length === 0 ? (
                                        <p className="text-sm text-slate-500 text-center py-3">
                                          No batches available. Add batches first.
                                        </p>
                                      ) : (
                                        <div className="grid grid-cols-3 gap-2">
                                          {batches.map((batch) => {
                                            const isSelected = selectedBatches.includes(batch.id);
                                            const isUsedInSameType = isBatchUsedInSameGroupType(
                                              batch.id,
                                              groupType.id,
                                              instance.id
                                            );
                                            const usedInInstance = isUsedInSameType
                                              ? getUsedInInstanceName(
                                                  batch.id,
                                                  groupType.id,
                                                  instance.id
                                                )
                                              : null;

                                            return (
                                              <button
                                                key={batch.id}
                                                onClick={() => toggleBatchSelection(batch.id)}
                                                disabled={isUsedInSameType}
                                                className={`relative px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                                                  isSelected
                                                    ? "bg-green-600 text-white"
                                                    : isUsedInSameType
                                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                                }`}
                                                title={
                                                  isUsedInSameType
                                                    ? `Already in ${usedInInstance}`
                                                    : ""
                                                }
                                              >
                                                {isSelected && (
                                                  <CheckCircle2 className="absolute -top-1 -right-1 w-3.5 h-3.5 text-white bg-green-600 rounded-full" />
                                                )}
                                                {batch.name}
                                                {isUsedInSameType && (
                                                  <div className="text-[9px] opacity-70 mt-0.5 truncate">
                                                    in {usedInInstance}
                                                  </div>
                                                )}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="p-3 bg-white">
                                      {instance.assignedBatches.length === 0 ? (
                                        <p className="text-xs text-slate-500 text-center py-2">
                                          No batches assigned yet
                                        </p>
                                      ) : (
                                        <div className="flex flex-wrap gap-2">
                                          {instance.assignedBatches.map((batchId) => {
                                            const batch = batches.find((b) => b.id === batchId);
                                            return batch ? (
                                              <span
                                                key={batchId}
                                                className="px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium"
                                              >
                                                {batch.name}
                                              </span>
                                            ) : null;
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="mt-12 flex justify-end">
          <button
            onClick={() => {
              console.log("Configuration saved");
            }}
            className="px-6 py-3 bg-[#9333ea] text-white rounded-xl font-semibold
              shadow-lg hover:bg-[#7c2dc4]
              transition-all duration-200"
          >
            Save Configuration
          </button>
        </div>
      </section>
    </main>
  );
};

export default BatchPage;