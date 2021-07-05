import { actionType as T } from '../reducer';
import localStorageManager from '../graph-builder/local-storage-manager';
import graphMLParser from '../graph-builder/graphml/parser';

const getGraphFun = (superState) => superState.graphs[superState.curGraphIndex]
                                        && superState.graphs[superState.curGraphIndex].instance;

const createNode = (state, setState) => {
    setState({
        type: T.Model_Open_Create_Node,
        cb: (label, style) => {
            const message = getGraphFun(state).validiateNode(label, style);
            if (message.ok) getGraphFun(state).addNode(label, style);
            return message;
        },
    });
};

const editElement = (state, setState) => {
    const shouldUpdateLabel = state.eleSelectedPayload.ids.length === 1;
    const tid = new Date().getTime();
    if (state.eleSelectedPayload.type === 'NODE') {
        setState({
            type: T.Model_Open_Update_Node,
            cb: (label, style) => state.eleSelectedPayload.ids.forEach(
                (id) => getGraphFun(state).updateNode(id, style, label, shouldUpdateLabel, tid),
            ),
            labelAllowed: shouldUpdateLabel,
            label: getGraphFun(state).getLabel(state.eleSelectedPayload.ids[0]),
            style: getGraphFun(state).getStyle(state.eleSelectedPayload.ids[0]),
        });
    }
    if (state.eleSelectedPayload.type === 'EDGE') {
        setState({
            type: T.Model_Open_Update_Edge,
            cb: (label, style) => state.eleSelectedPayload.ids.forEach(
                (id) => getGraphFun(state).updateEdge(id, style, label, shouldUpdateLabel, tid),
            ),
            labelAllowed: shouldUpdateLabel,
            label: getGraphFun(state).getLabel(state.eleSelectedPayload.ids[0]),
            style: getGraphFun(state).getStyle(state.eleSelectedPayload.ids[0]),
        });
    }
};

const deleteElem = (state) => {
    const tid = new Date().getTime();
    state.eleSelectedPayload.ids.forEach((id) => getGraphFun(state).deleteElem(id, tid));
};

const downloadImg = (state, setState, format) => {
    getGraphFun(state).downloadImg(format);
};

const saveAction = (state) => {
    getGraphFun(state).saveToDisk();
};

const readFile = (state, setState, e) => {
    if (e.target && e.target.files && e.target.files[0]) {
        const fr = new FileReader();
        fr.onload = (x) => {
            graphMLParser(x.target.result).then((graphContent) => {
                const id = new Date().getTime();
                localStorageManager.save(id, graphContent);
                setState({
                    type: T.ADD_GRAPH,
                    payload: { id, projectDetails: { ...graphContent.projectDetails, set: true } },
                });
            });
        };
        fr.readAsText(e.target.files[0]);
    }
};

const newProject = (state, setState) => {
    setState({ type: T.NEW_GRAPH });
};

const clearAll = (state) => {
    getGraphFun(state).clearAll();
};

const editDetails = (state, setState) => {
    setState({
        type: T.SET_PROJECT_DETAILS,
        payload: {
            projectDetails: { ...getGraphFun(state).projectDetails, set: false },
            id: getGraphFun(state).id,
        },
    });
};
const undo = (state) => {
    if (getGraphFun(state))getGraphFun(state).undo();
};
const redo = (state) => {
    getGraphFun(state).redo();
};

const openShareModal = (state, setState) => {
    setState({ type: T.SET_SHARE_MODAL, payload: true });
};

const openSettingModal = (state, setState) => {
    setState({ type: T.SET_SETTING_MODAL, payload: true });
};

export {
    createNode, editElement, deleteElem, downloadImg, saveAction,
    readFile, newProject, clearAll, editDetails, undo, redo,
    openShareModal, openSettingModal,
};