//@ts-ignore
import { useState } from "react";
import { Form, Input, Button, Table, Modal } from "antd";

export const Bus = () => {
  const [buses, setBuses] = useState<any>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    setBuses([...buses, { ...values, key: buses.length }]);
    form.resetFields();
    setIsModalOpen(false);
  };

  const columns = [
    { title: "Modelo", dataIndex: "model", key: "model" },
    { title: "Placa", dataIndex: "plate", key: "plate" },
    { title: "Capacidade", dataIndex: "capacity", key: "capacity" },
  ];

  return (
    <div>
      <Button type="primary" onClick={() => setIsModalOpen(true)}>
        Cadastrar Ônibus
      </Button>
      
      <Table columns={columns} dataSource={buses} style={{ marginTop: 20 }} />
      
      <Modal
        title="Cadastro de Ônibus"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item label="Modelo" name="model" rules={[{ required: true, message: "Insira o modelo" }]}> 
            <Input />
          </Form.Item>
          <Form.Item label="Placa" name="plate" rules={[{ required: true, message: "Insira a placa" }]}> 
            <Input />
          </Form.Item>
          <Form.Item label="Capacidade" name="capacity" rules={[{ required: true, message: "Insira a capacidade" }]}> 
            <Input type="number" />
          </Form.Item>
          <Button type="primary" htmlType="submit">Salvar</Button>
        </Form>
      </Modal>
    </div>
  );
};
