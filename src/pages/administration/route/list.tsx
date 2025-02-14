//@ts-ignore
import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polyline, Marker, useMapEvents, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  Button, 
  Select, 
  Spin, 
  Drawer, 
  Typography, 
  Modal, 
  Table, 
  Form, 
  Input, 
  InputNumber,
  Checkbox,
  TimePicker,
  Divider,
  Collapse
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';



const { Option } = Select;
const { Text } = Typography;
const { Panel } = Collapse;

interface Step {
  step: String;
  name?: string;
  maneuver?: { location: [number, number] };
  geometry?: { coordinates: [number, number][] };
  distance?: number;
  duration?: number;
}

interface Leg {
  steps: Step[]
}

const legs: Leg[] = []



// Corrigir ícones padrão do Leaflet

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const ClickHandler = ({ setPoints }: any) => {
  useMapEvents({
    click(e: any) {
      setPoints((prev: any) => [...prev, e.latlng]);
    },
  });
  return null;
};

export const Lines = () => {
  const [points, setPoints] = useState([]);
  const [addresses, setAddresses] = useState<any>([]);
  const [route, setRoute] = useState<any>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [legs, setLegs] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const mapRef = useRef<Map<any, any> | null>(null);



  const NOMINATIM_SERVERS = [
    "https://nominatim.openstreetmap.org",
    "https://nominatim.openstreetmap.de",
    "https://nominatim.openstreetmap.fr",
  ];

  const fetchAddressForPoint = async (lat: number, lng: number) => {
    for (const server of NOMINATIM_SERVERS) {
      const url = `${server}/reverse?format=json&lat=${lat}&lon=${lng}`;
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erro na API: ${response.status}`);
        
        const data = await response.json();
        return [data?.address?.road, data?.address?.suburb, data?.address?.city]
          .filter(Boolean)
          .join(", ") || "Endereço não encontrado";
      } catch (error) {
        console.warn(`Erro ao buscar no servidor ${server}, tentando outro...`);
      }
    }
    return "Erro ao buscar endereço";
  };

  const fetchAddresses = async (points: any) => {
    setLoading(true);
    const newAddresses = await Promise.all(
      points.map(async (point: any) => fetchAddressForPoint(point.lat, point.lng))
    );
    setAddresses(newAddresses);
    setLoading(false);
  };

  useEffect(() => {
    if (points.length > 0) fetchAddresses(points);
    else setAddresses([]);
  }, [points]);

  useEffect(() => {
    if (points.length < 2) return;
  
    const fetchRoute = async () => {
      const coordinates = points.map(({ lng, lat }) => `${lng},${lat}`).join(";");
      const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=true`;
  
      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.routes?.[0]) {
          const routeData = data.routes[0];
          setRoute(routeData.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]));
          setDistance(routeData.distance);
          setDuration(routeData.duration);
          setLegs(routeData.legs?.length > 0 ? routeData.legs : data.waypoints);
        }
      } catch (error) {
        console.error("Erro ao buscar a rota:", error);
      }
    };
  
    fetchRoute();
  }, [points]);

  const formatDuration = (seconds: any) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h${minutes.toString().padStart(2, '0')}m`;
  };

  const formatDurationFull = (seconds: any) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h${minutes.toString().padStart(2, '0')}min`;
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const completeData = {
        ...values,
        route: {
          points,
          addresses,
          distance,
          duration,
          coordinates: route
        }
      };
      console.log('Dados completos:', completeData);
      setModalVisible(false);
    } catch (error) {
      console.error('Erro no formulário:', error);
    }
  };

  const modalContent = (
    <Form form={form} layout="vertical" initialValues={{ acessibilidade: [], tiposPagamento: [] }}>
      <Collapse defaultActiveKey={['1']} ghost>
        <Panel header="Informações Básicas" key="1">
          <Form.Item name="numeroLinha" label="Número da Linha" rules={[{ required: true }]}>
            <Input placeholder="Ex: 123" />
          </Form.Item>

          <Form.Item name="nomeLinha" label="Nome da Linha" rules={[{ required: true }]}>
            <Input placeholder="Ex: Centro ↔ Zona Norte" />
          </Form.Item>

          <Form.Item name="tipoServico" label="Tipo de Serviço" rules={[{ required: true }]}>
            <Select>
              <Option value="urbano">Urbano</Option>
              <Option value="intermunicipal">Intermunicipal</Option>
              <Option value="expresso">Expresso</Option>
            </Select>
          </Form.Item>

          <Form.Item name="modalidade" label="Modalidade do Veículo">
            <Select>
              <Option value="convencional">Convencional</Option>
              <Option value="articulado">Articulado</Option>
              <Option value="brt">BRT</Option>
            </Select>
          </Form.Item>

          <Form.Item name="horarioOperacao" label="Horário de Operação">
            <Input.Group compact>
              <Form.Item name={['horarioOperacao', 'inicio']} noStyle>
                <TimePicker format="HH:mm" placeholder="Início" />
              </Form.Item>
              <span style={{ margin: '0 8px' }}>às</span>
              <Form.Item name={['horarioOperacao', 'termino']} noStyle>
                <TimePicker format="HH:mm" placeholder="Término" />
              </Form.Item>
            </Input.Group>
          </Form.Item>
        </Panel>

        <Panel header="Tarifas e Pagamento" key="2">
          <Form.Item name="tarifaIntegral" label="Tarifa Integral (R$)" rules={[{ required: true }]}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="tiposPagamento" label="Formas de Pagamento" rules={[{ required: true }]}>
            <Checkbox.Group options={[
              { label: 'Dinheiro', value: 'dinheiro' },
              { label: 'Cartão Transporte', value: 'cartao' },
              { label: 'Bilhete Único', value: 'bilhete' },
              { label: 'QR Code', value: 'qr' }
            ]} />
          </Form.Item>

          <Form.Item name="integracoes" label="Integrações com Outras Linhas">
            <Select mode="tags" placeholder="Adicione linhas integradas" />
          </Form.Item>
        </Panel>

        <Panel header="Frota e Acessibilidade" key="3">
          <Form.Item name="tipoFrota" label="Tipo de Frota">
            <Select>
              <Option value="padron">Padron</Option>
              <Option value="articulado">Articulado</Option>
              <Option value="eletrico">Elétrico</Option>
            </Select>
          </Form.Item>

          <Form.Item name="capacidade" label="Capacidade de Passageiros">
            <InputNumber min={0} placeholder="Número total de assentos" />
          </Form.Item>

          <Form.Item name="acessibilidade" label="Recursos de Acessibilidade">
            <Checkbox.Group options={[
              { label: 'Elevador para cadeirantes', value: 'elevador' },
              { label: 'Piso baixo', value: 'piso_baixo' },
              { label: 'Sinalização sonora', value: 'sinalizacao_sonora' }
            ]} />
          </Form.Item>
        </Panel>

        <Panel header="Operação e Gestão" key="4">
          <Form.Item name="empresa" label="Empresa Operadora" rules={[{ required: true }]}>
            <Input placeholder="Nome da empresa responsável" />
          </Form.Item>

          <Form.Item name="frequencia" label="Frequência Média (minutos)" rules={[{ required: true }]}>
            <InputNumber min={0} placeholder="Ex: 15" />
          </Form.Item>

          <Form.List name="horariosEspeciais">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ display: 'flex', marginBottom: 8 }}>
                    <Form.Item
                      {...restField}
                      name={[name, 'periodo']}
                      style={{ flex: 2, marginRight: 8 }}
                    >
                      <Input placeholder="Descrição (ex: Horário de Pico)" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'frequencia']}
                      style={{ flex: 1, marginRight: 8 }}
                    >
                      <InputNumber placeholder="Frequência (min)" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </div>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Adicionar Horário Especial
                </Button>
              </>
            )}
          </Form.List>
        </Panel>
      </Collapse>

      <Divider />

      <Table
        scroll={{ y: 300 }}
        columns={[
          { 
            title: 'Trecho', 
            dataIndex: 'name', 
            key: 'name',
            render: (name) => name || <Text type="secondary">Via sem nome</Text>
          },
          {
            title: 'Coordenadas',
            key: 'coordinates',
            render: (_, record) => (
              <div>
                {record.isFallback ? (
                  <>
                    <div>Origem: {record.startCoords?.join(', ')}</div>
                    <div>Destino: {record.endCoords?.join(', ')}</div>
                  </>
                ) : (
                  <>
                    <div>Início: {record.startCoords?.join(', ')}</div>
                    <div>Fim: {record.endCoords?.join(', ')}</div>
                  </>
                )}
              </div>
            ),
          },
          {
            title: 'Distância (km)',
            render: (_, record) => (record.distance / 1000).toFixed(2),
          },
          {
            title: 'Tempo',
            render: (_, record) => formatDuration(record.duration),
          },
        ]}
        dataSource={
          legs[0]?.steps 
            ? legs.flatMap((leg, legIndex) => 
                leg.steps.map((step, stepIndex) => ({
                  key: `${legIndex}-${stepIndex}`,
                  name: step.name,
                  startCoords: [
                    step.maneuver.location[1]?.toFixed(5),
                    step.maneuver.location[0]?.toFixed(5)
                  ],
                  endCoords: [
                    step.geometry.coordinates[step.geometry.coordinates.length - 1][1]?.toFixed(5),
                    step.geometry.coordinates[step.geometry.coordinates.length - 1][0]?.toFixed(5)
                  ],
                  distance: step.distance,
                  duration: step.duration,
                }))
              )
            : [{
                key: 'fallback-route',
                name: 'Rota completa',
                isFallback: true,
                startCoords: [
                  legs[0]?.location[1]?.toFixed(5),
                  legs[0]?.location[0]?.toFixed(5)
                ],
                endCoords: [
                  legs[1]?.location[1]?.toFixed(5),
                  legs[1]?.location[0]?.toFixed(5)
                ],
                distance: distance,
                duration: duration,
              }]
        }
        bordered
        pagination={false}
      />
    </Form>
  );

  return (
    <div>
      <div style={{ marginBottom: 10, display: "flex", gap: "10px" }}>
        <Button onClick={() => { setPoints([]); setRoute([]); setAddresses([]); }}>🗑️ Resetar Rota</Button>
        <Button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "🔒 Finalizar Edição" : "✏️ Editar Trajeto"}
        </Button>
        <Button 
          disabled={points.length < 2} 
          onClick={() => setModalVisible(true)}
        >
          ✅ Salvar Rota
        </Button>
        <Button onClick={() => setDrawerVisible(true)}>🔽 Mostrar Endereços</Button>
      </div>

      <MapContainer center={[-5.09408, -42.83625]} zoom={13} style={{ height: "70vh", width: "100%" }} whenReady={(map) => (mapRef.current = map)}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <ClickHandler setPoints={setPoints} />

        {points.map((point, index) => (
          <Marker
            key={index}
            position={point}
            draggable={isEditing}
            eventHandlers={{
              dragend: (e) => {
                const newPoints = [...points];
                newPoints[index] = e.target.getLatLng();
                setPoints(newPoints);
              },
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              {index === 0 ? "📍 Origem" : index === points.length - 1 ? "🏁 Destino" : `🚏 Parada ${index}`}
            </Tooltip>
          </Marker>
        ))}

        {route.length > 0 && <Polyline positions={route} color="blue" />}
      </MapContainer>

      {distance !== null && duration !== null && (
        <div style={{ marginTop: 10 }}>
          <Text><strong>Distância:</strong> {(distance / 1000).toFixed(2)} km</Text>
          <br />
          <Text><strong>Tempo de Percurso:</strong> {formatDuration(duration)}</Text>
        </div>
      )}

      <Drawer
        title="Endereços da Rota"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={400}
      >
        {loading ? (
          <Spin size="large" />
        ) : (
          <div>
            <div><strong>Origem:</strong> {addresses[0]}</div>
            {addresses.slice(1, -1).map((address: any, index: any) => (
              <div key={index}><strong>Parada {index + 1}:</strong> {address}</div>
            ))}
            <div><strong>Destino:</strong> {addresses[addresses.length - 1]}</div>
          </div>
        )}
      </Drawer>

      <Modal
        title="Cadastro Completo da Linha de Ônibus"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={1000}
        footer={[
          <div key="footer" style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%'
          }}>
            <div>
              <Text strong>Total:</Text>
              <Text style={{ marginLeft: 8 }}>
              {(distance ? (distance / 1000).toFixed(2) : "N/A")} km
              </Text>
              <Text style={{ marginLeft: 16 }}>
                {formatDurationFull(duration)}
              </Text>
            </div>
            <div>
              <Button onClick={() => setModalVisible(false)} style={{ marginRight: 8 }}>
                Cancelar
              </Button>
              <Button type="primary" onClick={handleSave}>
                Salvar Linha
              </Button>
            </div>
          </div>
        ]}
      >
        {modalContent}
      </Modal>
    </div>
  );
};