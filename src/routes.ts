import { GroundController } from "./controller/GroundController";

export const Routes = [
  {
    method: "get",
    route: "/namespace/:namespace/:key",
    controller: GroundController,
    action: "namespaceGet",
  },
  {
    method: "get",
    route: "/namespacekeys/:namespace",
    controller: GroundController,
    action: "namespaceKeys",
  },
  {
    method: "post",
    route: "/namespace/:namespace/:key",
    controller: GroundController,
    action: "namespacePost",
  },
  {
    method: "get",
    route: "/namespaceseq/:namespace",
    controller: GroundController,
    action: "namespaceSeq",
  },
  {
    method: "get",
    route: "/namespacesize/:namespace",
    controller: GroundController,
    action: "namespaceSize",
  },
  {
    method: "get",
    route: "/ping",
    controller: GroundController,
    action: "ping",
  },
  {
    method: "get",
    route: "/",
    controller: GroundController,
    action: "ping",
  },
];
