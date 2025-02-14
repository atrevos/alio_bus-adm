import React, { useContext, useState } from "react";
import { useLogin } from "@refinedev/core";
import { Form, Input, Button, Typography, Row, Col, Card, Image } from "antd";
import { CircularProgress } from "@mui/material";
import { LockOutlined, UserOutlined } from "@ant-design/icons";


const { Title } = Typography;


export const Login = () => {
  const { mutate: login, isLoading } = useLogin();
   const [modeColor, setModeColor] = useState(localStorage.getItem('colorMode'));
   
  return (
    <div className="auth-page" style={{background: modeColor === 'dark' ? '#333': 'white'}}>
      <Row justify="center" align="middle" style={{ height: "100vh" }}>
        
        <Col xs={22} sm={16} md={12} lg={5}>
        <Title 
              style={{
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                textAlign: 'center', 
                fontFamily: 'sans-serif', 
                color: "#009cde"
              }}
            >
          {/* <Image src="/lg_Drogaria_Globo 1.png" height={80} width={80} style={{ marginRight: '10px' }} /> */}
          Alió
        </Title>

          <Card style={{boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.1), 0 6px 20px 0 rgba(0, 0, 0, 0.1)"}}>
            <div className="auth-container">
              <Title level={4} style={{ textAlign: "center", height: "60px", color: "#009cde" }}>Faça login em sua conta</Title>
              <Form
                layout="vertical"
                onFinish={(values) => {
                  login(values);
                }}
                requiredMark={false}
                >

                <Form.Item
                  
                  name="email"
                  label="Email"
                  rules={[{ required: true, type: "email", message: "E-mail invalido" }]}
                  initialValue={"email@email.com"}
                >

                <Input prefix={<UserOutlined/>} placeholder="E-mail" disabled={isLoading}/>
                
                </Form.Item>
                <Form.Item
                  name="password"
                  label="Senha"
                  initialValue={"123"}
                  rules={[{ required: true, message: "Senha invalida" }]}
                >
                  <Input.Password prefix={<LockOutlined />}  placeholder="********" disabled={isLoading}/>
                
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" disabled={isLoading} block>
                    {isLoading ? <CircularProgress size={20} color={"primary"} /> : "Login"}
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};