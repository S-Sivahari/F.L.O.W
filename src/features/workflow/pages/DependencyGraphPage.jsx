import { useEffect, useState } from 'react';
import { getBlocks } from '../../../services/blocks.service.js';
import DependencyGraph from '../components/DependencyGraph.jsx';
import NodeDetailsDrawer from '../components/NodeDetailsDrawer.jsx';
import DependencyModal from '../components/DependencyModal.jsx';
import PageWrapper from '../../../shared/components/PageWrapper.jsx';

export default function DependencyGraphPage() {
  const [blocks, setBlocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [showDependencyModal, setShowDependencyModal] = useState(false);
  const [managingBlockId, setManagingBlockId] = useState(null);

  const loadBlocks = async () => {
    setIsLoading(true);
    try {
      const data = await getBlocks();
      setBlocks(data);
    } catch (error) {
      console.error('Failed to load blocks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBlocks();
  }, []);

  const handleNodeClick = (nodeData) => {
    setSelectedNodeId(nodeData.id);
    setShowDetailsDrawer(true);
  };

  const handleManageDependencies = (blockId) => {
    setManagingBlockId(blockId);
    setShowDependencyModal(true);
  };

  const handleDependencyModalClose = () => {
    setShowDependencyModal(false);
    setManagingBlockId(null);
  };

  const handleDependencySuccess = async () => {
    await loadBlocks();
    setShowDependencyModal(false);
  };

  return (
    <PageWrapper>
      <div className="page-header">
        <h1>Dependency Graph</h1>
      </div>

      <div style={{ height: 'calc(100vh - 200px)', marginBottom: 24 }}>
        {isLoading ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--text-secondary)',
            }}
          >
            Loading blocks...
          </div>
        ) : blocks.length === 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--text-secondary)',
            }}
          >
            No blocks available
          </div>
        ) : (
          <DependencyGraph blocks={blocks} onNodeClick={handleNodeClick} />
        )}
      </div>

      <NodeDetailsDrawer
        isOpen={showDetailsDrawer}
        nodeId={selectedNodeId}
        blocks={blocks}
        onClose={() => setShowDetailsDrawer(false)}
        onManageDependencies={handleManageDependencies}
      />

      <DependencyModal
        isOpen={showDependencyModal}
        blockId={managingBlockId}
        blocks={blocks}
        onClose={handleDependencyModalClose}
        onSuccess={handleDependencySuccess}
      />
    </PageWrapper>
  );
}
