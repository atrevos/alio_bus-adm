import { Authenticated, GitHubBanner, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';

import {
  ErrorComponent,
  ThemedLayoutV2,
  ThemedSiderV2,
  useNotificationProvider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import dataProvider from "@refinedev/simple-rest";
import { App as AntdApp } from "antd";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import { authProvider } from "./authProvider";
import { Header } from "./components/header";
import { ColorModeContextProvider } from "./contexts/color-mode";
import {
  BlogPostCreate,
  BlogPostEdit,
  BlogPostShow,
  HomeList,
} from "./pages/home";

import { ForgotPassword } from "./pages/forgotPassword";
import { Login } from "./pages/login";
import { Register } from "./pages/register";
import { AdminPanelSettings, AdminPanelSettingsOutlined, AdminPanelSettingsRounded, AdminPanelSettingsSharp, BusAlertOutlined, CircleNotifications, DriveEta, FindInPage, FindReplace, Home, LineAxisOutlined, RemoveCircle, SetMeal, Terminal, TerminalTwoTone, VerifiedUserOutlined } from "@mui/icons-material";
import { ApartmentOutlined, UsergroupDeleteOutlined, UserOutlined } from "@ant-design/icons";
import { Bus } from "./pages/administration/bus/list";
import { Lines } from "./pages/administration/route/list";

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            
              <Refine
                dataProvider={dataProvider("https://api.fake-rest.refine.dev")}
                notificationProvider={useNotificationProvider}
                routerProvider={routerBindings}
                authProvider={authProvider}
                resources={[
                  {
                    name: "home",
                    list: "/home",
                    create: "/home/create",
                    edit: "/home/edit/:id",
                    show: "/home/show/:id",
                    meta: {
                      canDelete: true,
                      label: 'Home'
                    },
                    icon: <Home />
                  },
                  {
                    name: "administrations",
                    list: "adm",
                    show: "adm",
                    meta: {
                      label: 'Administração',
                      icon: <ApartmentOutlined/>
                    } 
                  },
                  {
                    name: "administrations",
                    list: "/adm/bus",
                    meta: {
                      parent: 'administrations',
                      label: 'Onibus',
                      icon: <BusAlertOutlined/>
                    }
                  },
                  {
                    name: "lines",
                    list: "/adm/lines",
                    meta: {
                      parent: 'administrations',
                      label: 'Linhas',
                      icon: <LineAxisOutlined/>
                    }
                  },
                  {
                    name: "terminals",
                    list: "/adm/terminals",
                    meta: {
                      parent: 'administrations',
                      label: 'Terminais',
                      icon: <SetMeal/>
                    }
                  },
                  {
                    name: "drivers",
                    list: "/adm/drivers",
                    meta: {
                      parent: 'administrations',
                      label: 'Motoristas',
                      icon: <UsergroupDeleteOutlined/>
                    }
                  }
                ]}
                options={{
                  title: {text: 'Alió', icon: <DirectionsBusIcon/>},
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  useNewQueryKeys: true,
                  projectId: "4jEZRH-G9BInz-c1vnPW",
                }}
              >
                <Routes>
                  <Route
                    element={
                      <Authenticated
                        key="authenticated-inner"
                        fallback={<CatchAllNavigate to="/login" />}
                      >
                        <ThemedLayoutV2
                          Header={Header}
                          Sider={(props) => <ThemedSiderV2 {...props} fixed />}
                        >
                          <Outlet />
                        </ThemedLayoutV2>
                      </Authenticated>
                    }
                  >
                    <Route
                      index
                      element={<NavigateToResource resource="home" />}
                    />
                    <Route path="/home">
                      <Route index element={<HomeList />} />
                      <Route path="create" element={<BlogPostCreate />} />
                      <Route path="edit/:id" element={<BlogPostEdit />} />
                      <Route path="show/:id" element={<BlogPostShow />} />
                    </Route>
                    
                    {/* Rota de cadastro e listagem de onibus */}
                    <Route path="/adm/bus">
                      <Route index element={<Bus />}/>
                    </Route>

                    {/* Linhas, cadastros e listagem */}
                    <Route path="/adm/lines">
                      <Route index element={<Lines />}/>
                    </Route>

                    <Route path="*" element={<ErrorComponent />} />
                  </Route>
                  <Route
                    element={
                      <Authenticated
                        key="authenticated-outer"
                        fallback={<Outlet />}
                      >
                        <NavigateToResource />
                      </Authenticated>
                    }
                  >
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                      path="/forgot-password"
                      element={<ForgotPassword />}
                    />
                  </Route>
                </Routes>

                <RefineKbar />
                <UnsavedChangesNotifier />
                <DocumentTitleHandler />
              </Refine>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
