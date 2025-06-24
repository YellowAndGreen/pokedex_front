import React from 'react';

// This component is being replaced by BirdSightingTimeline.tsx
// Keeping the file to avoid breaking potential imports, but its usage should be removed.

export interface BirdSightingRecord {
  id: string;
  chineseName: string;
  latinName: string;
  englishName: string;
  order: string;
  family: string;
  count: number;
  recordDate: string;
}

interface BirdSightingTableProps {
  records: BirdSightingRecord[];
}

const BirdSightingTable: React.FC<BirdSightingTableProps> = ({ records }) => {
  console.warn('BirdSightingTable is deprecated and should be replaced with BirdSightingTimeline.');
  if (records.length === 0) {
    return <p>No bird sighting records available. (Table Deprecated)</p>;
  }
  return (
    <div>
      <p>BirdSightingTable - This component is deprecated.</p>
      {/* Minimalistic rendering or placeholder if needed during transition */}
      <ul>
        {records.slice(0, 5).map(r => (
          <li key={r.id}>{r.chineseName}</li>
        ))}
      </ul>
    </div>
  );
};

export default BirdSightingTable;
