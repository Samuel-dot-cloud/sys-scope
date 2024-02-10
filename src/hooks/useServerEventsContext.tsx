import {useContext} from "react";
import {ServerEventsContext} from "../providers/ServerEventsProvider.tsx";


const useServerEventsContext = () => useContext(ServerEventsContext);

export default useServerEventsContext;