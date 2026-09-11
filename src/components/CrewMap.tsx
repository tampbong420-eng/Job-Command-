import type { Employee, Job } from '@/types';
import { timeAgo } from '@/lib/format';
import { useEffect, useRef } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';

function Fit({ points }: { points: Array<[number, number]> }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (fitted.current || !points.length) return;
    map.fitBounds(points, { padding: [36, 36], maxZoom: 13 });
    fitted.current = true;
  }, [map, points]);
  return null;
}

const statusColor: Record<string, string> = {
  available: '#34d399',
  enroute: '#f59e0b',
  onjob: '#38bdf8',
  offline: '#737373',
};

export function CrewMap({
  employees,
  jobs,
  onOpenEmployee,
}: {
  employees: Employee[];
  jobs: Job[];
  onOpenEmployee: (employee: Employee) => void;
}) {
  const points: Array<[number, number]> = [
    ...employees.map((emp) => [emp.lat, emp.lng] as [number, number]),
    ...jobs.map((job) => [job.lat, job.lng] as [number, number]),
  ];
  const center = points[0] ?? [27.9506, -82.4572];

  return (
    <MapContainer center={center} zoom={12} scrollWheelZoom className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Fit points={points} />
      {jobs.map((job) => (
        <CircleMarker
          key={job.id}
          center={[job.lat, job.lng]}
          radius={9}
          pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.35, weight: 2 }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-black uppercase tracking-wider text-amber-500 text-[10px]">Job</p>
              <p className="font-bold">{job.customerName}</p>
              <p className="text-neutral-400">{job.address}</p>
              <p className="text-xs mt-1 uppercase tracking-wider">{job.status.replace('_', ' ')}</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
      {employees.map((emp) => (
        <CircleMarker
          key={emp.id}
          center={[emp.lat, emp.lng]}
          radius={11}
          pathOptions={{
            color: statusColor[emp.status] ?? '#f5f5f5',
            fillColor: statusColor[emp.status] ?? '#f5f5f5',
            fillOpacity: 0.9,
            weight: 2,
          }}
        >
          <Popup>
            <div className="text-sm space-y-2">
              <p className="font-bold">{emp.name}</p>
              <p className="text-neutral-400 text-xs">
                {emp.role} · {emp.speed} MPH · {emp.battery}% · {timeAgo(emp.lastPing)}
              </p>
              <button
                type="button"
                className="text-xs bg-amber-500 text-neutral-950 font-black px-3 py-1.5 rounded-lg"
                onClick={() => onOpenEmployee(emp)}
              >
                Invite link
              </button>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

export default CrewMap;
