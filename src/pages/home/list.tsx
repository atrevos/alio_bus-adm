import React, { useEffect, useRef } from "react";
import { Card, Row, Col, Progress, List, Typography, Space } from "antd";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { AppstoreAddOutlined, PlayCircleOutlined, PushpinOutlined } from "@ant-design/icons";
import { WarehouseOutlined } from "@mui/icons-material";
import busIcon from "../../assets/bus_processed.png";
import 'leaflet-rotatedmarker';

// Lista de ônibus com coordenadas e orientação
const buses = [
  { 
    id: 1, 
    name: "Ônibus 01", 
    coords: [-5.110888, -42.843], 
    status: "Em Rota",
    angle: -25
  },
  { 
    id: 2, 
    name: "Ônibus 02", 
    coords: [-5.094223819647218, -42.83622824641949], 
    status: "Na Garagem",
    angle: -25
  },
  { 
    id: 3, 
    name: "Ônibus 03", 
    coords: [-5.093415723130931, -42.832979211712676], 
    status: "No Terminal",
    angle: 65
  },
];

// Configuração do ícone
const customIcon = new L.Icon({
  iconUrl: busIcon,
  iconSize: [60, 20],
  iconAnchor: [25, 14],  // Centro da base do ícone
  popupAnchor: [0, -23], // Popup acima do marcador
  className: 'rotated-marker'
});

// Componente do Mapa
const Map = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  return (
    <MapContainer
      center={[-5.0945, -42.8366]}
      zoom={14}
      style={{ height: "400px", width: "100%" }}
      whenCreated={(map) => (mapRef.current = map)}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {buses.map((bus) => (
        <Marker
          key={bus.id}
          position={bus.coords}
          icon={customIcon}
          rotationAngle={bus.angle}
          rotationOrigin="center"
        >
          <Popup>
            <div>
              <h3>{bus.name}</h3>
              <p>Status: {bus.status}</p>
              <p>Direção: {bus.angle}°</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

// Componente Principal
export const HomeList = () => {
  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <PlayCircleOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
            <Typography.Title level={4} style={{ marginTop: "10px" }}>
              {buses.filter((bus) => bus.status === "Em Rota").length}
            </Typography.Title>
            <Typography.Text>Em rota</Typography.Text>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <WarehouseOutlined style={{ fontSize: "24px", color: "#52c41a" }} />
            <Typography.Title level={4} style={{ marginTop: "10px" }}>
              {buses.filter((bus) => bus.status === "Na Garagem").length}
            </Typography.Title>
            <Typography.Text>Garagem</Typography.Text>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <PushpinOutlined style={{ fontSize: "24px", color: "#f5222d" }} />
            <Typography.Title level={4} style={{ marginTop: "10px" }}>
              {buses.filter((bus) => bus.status === "No Terminal").length}
            </Typography.Title>
            <Typography.Text>Terminal</Typography.Text>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <AppstoreAddOutlined style={{ fontSize: "24px", color: "#fa8c16" }} />
            <Typography.Title level={4} style={{ marginTop: "10px" }}>
              {buses.length}
            </Typography.Title>
            <Typography.Text>Total</Typography.Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card title="Mapa de Ônibus" style={{ height: "auto" }}>
            <Map />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Status da Frota">
            <Progress
              percent={(buses.filter((bus) => bus.status === "Em Rota").length / buses.length) * 100}
            />
            <Typography.Text>
              Ônibus em rota: {buses.filter((bus) => bus.status === "Em Rota").length}
            </Typography.Text>
            <br />
            <Typography.Text>
              Ônibus na garagem: {buses.filter((bus) => bus.status === "Na Garagem").length}
            </Typography.Text>
            <br />
            <Typography.Text>
              Ônibus no terminal: {buses.filter((bus) => bus.status === "No Terminal").length}
            </Typography.Text>
          </Card>

          <Card title="Horários e Rotas dos Ônibus" style={{ marginTop: 16 }}>
            <List
              dataSource={buses.map((bus) => ({
                route: bus.name,
                time: "10:00 AM - 10:30 AM",
              }))}
              renderItem={(bus) => (
                <List.Item>
                  <Typography.Text strong>{bus.route}</Typography.Text> -{" "}
                  <Typography.Text>{bus.time}</Typography.Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Estilos globais */}
      <style>
        {`
          .leaflet-marker-icon.rotated-marker {
            transition: transform 0.3s ease;
            transform-origin: center center;
          }
        `}
      </style>
    </Space>
  );
};