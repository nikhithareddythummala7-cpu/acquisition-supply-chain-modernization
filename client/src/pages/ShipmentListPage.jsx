import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Table } from '../components/common/Table';
import { Pagination } from '../components/common/Pagination';
import { Skeleton } from '../components/common/Skeleton';
import api from '../services/api';
import { Package, Eye, Plus } from 'lucide-react';

export const ShipmentListPage = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShipments = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/shipments?page=${page}&limit=10`);
        setShipments(res.data.shipments || []);
        setPages(res.data.pages || 1);
        setTotal(res.data.total || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchShipments();
  }, [page]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shipment Cargo Registry"
        subtitle="Detailed log of all active and completed cargo shipments."
      />

      {loading ? (
        <Skeleton className="h-64" />
      ) : (
        <Card className="!p-0">
          <Table headers={['Shipment ID', 'Item Cargo', 'Supplier', 'Tracking #', 'Expected Date', 'Status', 'Inspection Status', 'Actions']}>
            {shipments.map((shp) => (
              <tr key={shp._id} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-3 font-mono text-cyan-400 font-semibold">{shp.shipmentId}</td>
                <td className="px-4 py-3 font-medium text-slate-200">{shp.item}</td>
                <td className="px-4 py-3 text-slate-300">{shp.supplierId?.companyName || 'Supplier'}</td>
                <td className="px-4 py-3 font-mono text-slate-400">{shp.trackingNumber}</td>
                <td className="px-4 py-3 text-slate-300">{new Date(shp.expectedDeliveryDate).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <Badge variant={shp.status === 'DELAYED' ? 'danger' : shp.status === 'DELIVERED' ? 'success' : 'info'}>
                    {shp.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={shp.inspectionStatus === 'PASSED' ? 'success' : shp.inspectionStatus === 'FAILED' ? 'danger' : 'neutral'}>
                    {shp.inspectionStatus}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Button variant="outline" size="sm" icon={Eye} onClick={() => navigate(`/shipments/${shp._id}`)}>
                    Details
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
          <div className="p-4 border-t border-slate-800">
            <Pagination page={page} pages={pages} total={total} onPageChange={setPage} />
          </div>
        </Card>
      )}
    </div>
  );
};
