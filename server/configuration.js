module.exports = {
        "queries": {
                    "cluster" : {
                                    "nodesSummary" :  `
                                                        WITH vw_cpu AS (
                                                            SELECT cluster_id, group_id, instance_type, instance_id, market_type, role, az, private_ip, total_vcpu, MAX(time) as time, cast('100' as int) - MAX_BY(usage_idle, time) as cpu_usage
                                                            FROM emrdb.cpu
                                                            WHERE time between ago(5m) and now() and cluster_id = '{cluster_id}'
                                                            group by cluster_id, group_id, instance_type, instance_id, market_type, role, az, private_ip, total_vcpu
                                                        ),
                                                        vw_memory AS(
                                                            SELECT cluster_id, group_id, instance_type, instance_id, market_type, role, az, private_ip, total as total_memory, MAX(time) as time, MAX_BY(used_percent, time) as memory_usage
                                                            FROM emrdb.memory
                                                            WHERE time between ago(5m) and now() and cluster_id = '{cluster_id}'
                                                            group by cluster_id, group_id, instance_type, instance_id, market_type, role, az, private_ip, total
                                                        ), 
                                                        vw_disk_level_1 AS (
                                                            SELECT time,cluster_id, group_id, instance_type, instance_id, market_type, role, az, private_ip, SUM(read_bytes_rate) as read_bytes, SUM(write_bytes_rate) as write_bytes, SUM(reads_rate) as reads, SUM(writes_rate) as writes
                                                            FROM emrdb.disk
                                                            WHERE time between ago(5m) and now() and cluster_id = '{cluster_id}'
                                                            group by time,cluster_id, group_id, instance_type, instance_id, market_type, role, az, private_ip
                                                        ),
                                                        vw_disk AS (
                                                            SELECT cluster_id, group_id, instance_type, instance_id, market_type, role, az, private_ip, MAX(time) as time, MAX_BY(read_bytes, time) as read_bytes, MAX_BY(write_bytes, time) as write_bytes, MAX_BY(reads, time) as io_reads, MAX_BY(writes, time) as io_writes
                                                            FROM vw_disk_level_1
                                                            WHERE time between ago(5m) and now() and cluster_id = '{cluster_id}'
                                                            group by cluster_id, group_id, instance_type, instance_id, market_type, role, az, private_ip
                                                        ),
                                                        vw_network_level_1 AS (
                                                            SELECT time,cluster_id, group_id, instance_type, instance_id, market_type, role, az, private_ip, SUM(bytes_sent_rate) as sent_bytes, SUM(bytes_recv_rate) as recv_bytes
                                                            FROM emrdb.network
                                                            WHERE time between ago(5m) and now() and cluster_id = '{cluster_id}'
                                                            group by time,cluster_id, group_id, instance_type, instance_id, market_type, role, az, private_ip
                                                        ),
                                                        vw_network AS (
                                                            SELECT cluster_id, group_id, instance_type, instance_id, market_type, role, az, private_ip, MAX(time) as time, MAX_BY(sent_bytes, time) as sent_bytes, MAX_BY(recv_bytes, time) as recv_bytes
                                                            FROM vw_network_level_1
                                                            WHERE time between ago(5m) and now() and cluster_id = '{cluster_id}'
                                                            group by cluster_id, group_id, instance_type, instance_id, market_type, role, az, private_ip
                                                        )
                                                        SELECT 
                                                        	vw_cpu.cluster_id, 
                                                            vw_cpu.group_id, 
                                                            vw_cpu.instance_type, 
                                                            vw_cpu.instance_id, 
                                                            vw_cpu.market_type, 
                                                            vw_cpu.role, 
                                                            vw_cpu.az, 
                                                            vw_cpu.private_ip,	
                                                            vw_cpu.total_vcpu,
                                                            vw_cpu.cpu_usage, 
                                                            vw_memory.memory_usage,
                                                            vw_memory.total_memory,
                                                            vw_disk.read_bytes,
                                                            vw_disk.write_bytes,
                                                            vw_disk.write_bytes + vw_disk.read_bytes as total_disk_bytes,
                                                            vw_disk.io_reads,
                                                            vw_disk.io_writes,
                                                            vw_disk.io_reads + vw_disk.io_writes as total_iops,
                                                            vw_network.sent_bytes,
                                                            vw_network.recv_bytes,
                                                            vw_network.sent_bytes + vw_network.recv_bytes as total_network_bytes
                                                        FROM 
                                                            vw_cpu, vw_memory, vw_disk, vw_network
                                                        WHERE
                                                            vw_cpu.cluster_id = vw_memory.cluster_id
                                                            and
                                                            vw_cpu.instance_id = vw_memory.instance_id
                                                            and
                                                            vw_cpu.cluster_id = vw_disk.cluster_id
                                                            and
                                                            vw_cpu.instance_id = vw_disk.instance_id
                                                            and
                                                            vw_cpu.cluster_id = vw_network.cluster_id
                                                            and
                                                            vw_cpu.instance_id = vw_network.instance_id
                                                        `,
                                    "nodesByRole" : 
                                                        `
                                                        WITH vw_nodes AS (
                                                            SELECT BIN(time,1m) as time,cluster_id,instance_id,role
                                                            FROM emrdb.cpu
                                                            WHERE time between ago({period}) and now() and cluster_id = '{cluster_id}'
                                                            GROUP BY BIN(time,1m),cluster_id,instance_id,role
                                                        )
                                                        SELECT 
                                                            time,
                                                            role, 
                                                            count(*) as total
                                                        FROM 
                                                            vw_nodes
                                                        GROUP BY 
                                                            time,role
                                                        ORDER BY 
                                                            role,time desc
                                                        `,
                                    "nodesByInstanceType" : 
                                                        `
                                                        WITH vw_nodes AS (
                                                            SELECT BIN(time, 1m ) as time,cluster_id,instance_id,instance_type
                                                            FROM emrdb.cpu
                                                            WHERE time between ago({period}) and now() and cluster_id = '{cluster_id}'
                                                            GROUP BY BIN(time, 1m ),cluster_id,instance_id,instance_type
                                                        )
                                                        SELECT time,instance_type, count(*) as total
                                                        FROM vw_nodes
                                                        GROUP BY time,instance_type
                                                        ORDER BY instance_type,time desc
                                                        `,
                                    "nodesByMarketType" : 
                                                        `
                                                        WITH vw_nodes AS (
                                                            SELECT BIN(time, 1m ) as time,cluster_id,instance_id,market_type
                                                            FROM emrdb.cpu
                                                            WHERE time between ago({period}) and now() and cluster_id = '{cluster_id}'
                                                            GROUP BY BIN(time, 1m ),cluster_id,instance_id,market_type
                                                        )
                                                        SELECT time,market_type, count(*) as total
                                                        FROM vw_nodes
                                                        GROUP BY time,market_type
                                                        ORDER BY market_type,time desc
                                                        `,
                                    "clusterHostSummary" : 
                                                        `
                                                        WITH vw_cpu AS (
                                                            SELECT 
                                                                cluster_id,
                                                                BIN(time, 10s ) as time,
                                                                AVG(100-usage_idle) as cpu_usage_avg, 
                                                                MAX(100-usage_idle) as cpu_usage_max, 
                                                                MIN(100-usage_idle) as cpu_usage_min
                                                            FROM 
                                                                emrdb.cpu
                                                            WHERE 
                                                                time between ago(15m) and now() and cluster_id = '{cluster_id}'
                                                            GROUP BY 
                                                                cluster_id,BIN(time, 10s )
                                                        ),
                                                        vw_memory AS (
                                                            SELECT 
                                                                cluster_id,
                                                                BIN(time, 10s ) as time,
                                                                AVG(used_percent) as memory_usage_avg, 
                                                                MAX(used_percent) as memory_usage_max, 
                                                                MIN(used_percent) as memory_usage_min
                                                            FROM 
                                                                emrdb.memory
                                                            WHERE 
                                                                time between ago(15m) and now() and cluster_id = '{cluster_id}'
                                                            GROUP BY 
                                                                cluster_id,BIN(time, 10s )
                                                        ),
                                                        vw_disk_level_1 AS (
                                                            SELECT 
                                                                    time, 
                                                                    cluster_id,
                                                                    instance_id,
                                                                    SUM(read_bytes_rate) as read_bytes,
                                                                    SUM(write_bytes_rate) as write_bytes, 
                                                                    SUM(reads_rate) as io_reads, 
                                                                    SUM(writes_rate) as io_writes
                                                            FROM 
                                                                    emrdb.disk
                                                            WHERE 
                                                                    time between ago(60m) and now() and cluster_id = '{cluster_id}'
                                                            GROUP BY 
                                                                    time,
                                                                    cluster_id,
                                                                    instance_id
                                                        ),
                                                        vw_disk_level_2 AS (
                                                            SELECT 
                                                                    BIN(time, 10s ) as time,
                                                                    cluster_id,
                                                                    instance_id,
                                                                    AVG(read_bytes) as read_bytes,
                                                                    AVG(write_bytes) as write_bytes,
                                                                    AVG(io_reads) as io_reads,
                                                                    AVG(io_writes) as io_writes
                                                            FROM 
                                                                    vw_disk_level_1
                                                            GROUP BY 
                                                                    BIN(time, 10s ),
                                                                    cluster_id,
                                                                    instance_id
                                                        ),
                                                        vw_disk AS (
                                                            SELECT 
                                                                    cluster_id,
                                                                    BIN(time, 10s ) as time, 
                                                                    AVG(read_bytes) as read_bytes_avg,
                                                                    AVG(write_bytes) as write_bytes_avg, 
                                                                    AVG(io_reads) as io_reads_avg, 
                                                                    AVG(io_writes) as io_writes_avg,
                                                                    MAX(read_bytes) as read_bytes_max,
                                                                    MAX(write_bytes) as write_bytes_max, 
                                                                    MAX(io_reads) as io_reads_max, 
                                                                    MAX(io_writes) as io_writes_max,
                                                                    MIN(read_bytes) as read_bytes_min,
                                                                    MIN(write_bytes) as write_bytes_min, 
                                                                    MIN(io_reads) as io_reads_min, 
                                                                    MIN(io_writes) as io_writes_min,
                                                                    SUM(read_bytes) as read_bytes_sum,
                                                                    SUM(write_bytes) as write_bytes_sum, 
                                                                    SUM(io_reads) as io_reads_sum, 
                                                                    SUM(io_writes) as io_writes_sum
                                                            FROM 
                                                                    vw_disk_level_2
                                                            GROUP BY 
                                                                    cluster_id,BIN(time, 10s )
                                                        ),
                                                        vw_network_level_1 AS (
                                                            SELECT 
                                                                    time, 
                                                                    cluster_id,
                                                                    instance_id,
                                                                    SUM(bytes_sent_rate) as bytes_sent,
                                                                    SUM(bytes_recv_rate) as bytes_recv
                                                            FROM 
                                                                    emrdb.network
                                                            WHERE 
                                                                    time between ago(60m) and now() and cluster_id = '{cluster_id}'
                                                            GROUP BY 
                                                                    time,
                                                                    cluster_id,
                                                                    instance_id
                                                        ),
                                                        vw_network_level_2 AS (
                                                            SELECT 
                                                                    BIN(time, 10s ) as time,
                                                                    cluster_id,
                                                                    instance_id,
                                                                    AVG(bytes_sent) as bytes_sent,
                                                                    AVG(bytes_recv) as bytes_recv
                                                            FROM 
                                                                    vw_network_level_1
                                                            GROUP BY 
                                                                    BIN(time, 10s ),
                                                                    cluster_id,
                                                                    instance_id
                                                        ),
                                                        vw_network AS (
                                                            SELECT 
                                                                    cluster_id,
                                                                    BIN(time, 10s ) as time,
                                                                    AVG(bytes_sent) as bytes_sent_avg,
                                                                    MAX(bytes_sent) as bytes_sent_max,
                                                                    MIN(bytes_sent) as bytes_sent_min,
                                                                    SUM(bytes_sent) as bytes_sent_sum,
                                                                    AVG(bytes_recv) as bytes_recv_avg,
                                                                    MAX(bytes_recv) as bytes_recv_max,
                                                                    MIN(bytes_recv) as bytes_recv_min, 
                                                                    SUM(bytes_recv) as bytes_recv_sum
                                                            FROM 
                                                                    vw_network_level_2
                                                            GROUP BY 
                                                                    cluster_id,BIN(time, 10s )
                                                        )
                                                        SELECT
                                                            vw_cpu.time,
                                                            vw_cpu.cpu_usage_avg,
                                                            vw_cpu.cpu_usage_max,
                                                            vw_cpu.cpu_usage_min,
                                                            vw_memory.memory_usage_avg,
                                                            vw_memory.memory_usage_max,
                                                            vw_memory.memory_usage_min,
                                                            vw_disk.read_bytes_sum as disk_bytes_reads,
                                                            vw_disk.write_bytes_sum as disk_bytes_writes,
                                                            (vw_disk.read_bytes_sum + vw_disk.write_bytes_sum) as disk_bytes,
                                                            (vw_disk.read_bytes_avg + vw_disk.write_bytes_avg) as disk_bytes_avg,
                                                            (vw_disk.read_bytes_max + vw_disk.write_bytes_max) as disk_bytes_max,
                                                            (vw_disk.read_bytes_min + vw_disk.write_bytes_min) as disk_bytes_min,
                                                            vw_disk.io_reads_sum as disk_io_reads,
                                                            vw_disk.io_writes_sum as disk_io_writes,
                                                            (vw_disk.io_writes_sum + vw_disk.io_reads_sum) as disk_iops,
                                                            (vw_disk.io_writes_avg + vw_disk.io_reads_avg) as disk_iops_avg,
                                                            (vw_disk.io_writes_max + vw_disk.io_reads_max) as disk_iops_max,
                                                            (vw_disk.io_writes_min + vw_disk.io_reads_min) as disk_iops_min,
                                                            vw_network.bytes_sent_sum as network_sent_bytes,
                                                            vw_network.bytes_recv_sum as network_recv_bytes,
                                                            (vw_network.bytes_sent_sum + vw_network.bytes_recv_sum) as network_bytes,
                                                            (vw_network.bytes_sent_avg + vw_network.bytes_recv_avg) as network_bytes_avg,
                                                            (vw_network.bytes_sent_max + vw_network.bytes_recv_max) as network_bytes_max,
                                                            (vw_network.bytes_sent_min + vw_network.bytes_recv_min) as network_bytes_min
                                                        FROM 
                                                            vw_cpu, vw_memory, vw_disk, vw_network
                                                        WHERE
                                                            vw_cpu.cluster_id = vw_memory.cluster_id
                                                            and
                                                            vw_cpu.time = vw_memory.time
                                                            and
                                                            vw_cpu.cluster_id = vw_disk.cluster_id
                                                            and
                                                            vw_cpu.time = vw_disk.time
                                                            and
                                                            vw_cpu.cluster_id = vw_network.cluster_id
                                                            and
                                                            vw_cpu.time = vw_network.time
                                                        ORDER BY 
                                                            vw_cpu.time
                                                        `,
                                    "clusterHadoopSummary" : 
                                                        `
                                                            SELECT 
                                                                cluster_id, 
                                                                MAX(time) as time,
                                                                MAX_BY(coresAvailable, time) as coresAvailable,
                                                                MAX_BY(coresAllocated, time) as coresAllocated,
                                                                MAX_BY(coresPending, time) as coresPending,
                                                                MAX_BY(coresTotal, time) as coresTotal,
                                                                MAX_BY(coresUsage, time) as coresUsage,
                                                                MAX_BY(coresReserved, time) as coresReserved,
                                                                MAX_BY(memoryAllocated, time) * 1024 * 1024 as memoryAllocated,
                                                                MAX_BY(memoryAvailable, time) * 1024 * 1024 as memoryAvailable,
                                                                MAX_BY(memoryPending, time) * 1024 * 1024 as memoryPending,
                                                                MAX_BY(memoryReserved, time) * 1024 * 1024 as memoryReserved,
                                                                MAX_BY(memoryTotal, time) * 1024 * 1024 as memoryTotal,
                                                                MAX_BY(memoryUsage, time)  as memoryUsage,
                                                                MAX_BY(appsCompleted, time) as appsCompleted,
                                                                MAX_BY(appsFailed, time) as appsFailed,
                                                                MAX_BY(appsKilled, time) as appsKilled,
                                                                MAX_BY(appsPending, time) as appsPending,
                                                                MAX_BY(appsRunning, time) as appsRunning,
                                                                MAX_BY(appsSubmitted, time) as appsSubmitted,
                                                                MAX_BY(containersAllocated, time) as containersAllocated,
                                                                MAX_BY(containersPending, time) as containersPending,
                                                                MAX_BY(containersReserved, time) as containersReserved,
                                                                MAX_BY(nodesDecommissioned, time) as nodesDecommissioned,
                                                                MAX_BY(nodesDecommissioning, time) as nodesDecommissioning,
                                                                MAX_BY(nodesActive, time) as nodesActive,
                                                                MAX_BY(nodesLost, time) as nodesLost,
                                                                MAX_BY(nodesRebooted, time) as nodesRebooted,
                                                                MAX_BY(nodesShutdown, time) as nodesShutdown,
                                                                MAX_BY(nodesTotal, time) as nodesTotal,
                                                                MAX_BY(nodesUnhealthy, time) as nodesUnhealthy
                                                            FROM 
                                                                emrdb.hadoop
                                                            WHERE 
                                                                time between ago(5m) and now() and cluster_id = '{cluster_id}'
                                                            GROUP BY 
                                                                cluster_id
                                                        `
                            }
            }
};
