import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { getDb } from '../lib/database';
import { RemoteRepository } from '../lib/remoteRepository';

let isSyncingInProgress = false;

export async function runSyncEngine() {
  if (isSyncingInProgress) {
    console.log('[Sync Engine] Sync already in progress. Blocking duplicate execution.');
    return;
  }

  try {
    isSyncingInProgress = true;
    const db = await getDb();
    
    const unsyncedVehicles = await db.getAllAsync<any>(`SELECT * FROM Vehicles WHERE is_synced = 0`);
    const unsyncedFuels = await db.getAllAsync<any>(`SELECT * FROM RefuelLogs WHERE is_synced = 0`);
    const unsyncedMaints = await db.getAllAsync<any>(`SELECT * FROM MaintenanceLogs WHERE is_synced = 0`);

    if (unsyncedVehicles.length === 0 && unsyncedFuels.length === 0 && unsyncedMaints.length === 0) {
      return; 
    }

    console.log(`[Sync Engine] Found ${unsyncedVehicles.length} vehicles, ${unsyncedFuels.length} fuels, ${unsyncedMaints.length} maints to upload.`);

    for (const v of unsyncedVehicles) {
      try {
        const vehiclePayload = {
          ...v,
          hasSyncedManual: v.hasSyncedManual === 1
        };
        const serverData = await RemoteRepository.syncVehicle(vehiclePayload);
        await db.runAsync(`UPDATE Vehicles SET serverId = ?, is_synced = 1 WHERE id = ?`, [serverData.id, v.id]);
      } catch (e) {
        console.error(`Failed to sync vehicle ${v.id}`, e);
      }
    }

    for (const f of unsyncedFuels) {
      try {
        const parent = await db.getFirstAsync<{serverId: number}>(`SELECT serverId FROM Vehicles WHERE id = ?`, [f.vehicleId]);
        if (parent?.serverId) {
          const fuelPayload = { ...f, vehicleId: parent.serverId };
          const serverData = await RemoteRepository.syncFuelLog(fuelPayload);
          await db.runAsync(`UPDATE RefuelLogs SET serverId = ?, is_synced = 1 WHERE id = ?`, [serverData.id, f.id]);
        }
      } catch (e) {
        console.error(`Failed to sync fuel log ${f.id}`, e);
      }
    }

    for (const m of unsyncedMaints) {
      try {
        const parent = await db.getFirstAsync<{serverId: number}>(`SELECT serverId FROM Vehicles WHERE id = ?`, [m.vehicleId]);
        if (parent?.serverId) {
          const maintPayload = {
            ...m,
            vehicleId: parent.serverId,
            isDIY: m.isDIY === 1
          };
          const serverData = await RemoteRepository.syncMaintenanceLog(maintPayload);
          await db.runAsync(`UPDATE MaintenanceLogs SET serverId = ?, is_synced = 1 WHERE id = ?`, [serverData.id, m.id]);
        }
      } catch (e) {
        console.error(`Failed to sync maint log ${m.id}`, e);
      }
    }

    console.log('[Sync Engine] Sync cycle complete.');
  } catch (error) {
    console.error('[Sync Engine] Critical failure:', error);
  } finally {
    isSyncingInProgress = false;
  }
}

export function useAutoSync() {
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        runSyncEngine();
      }
    });

    runSyncEngine();

    return () => unsubscribe();
  }, []);
}
