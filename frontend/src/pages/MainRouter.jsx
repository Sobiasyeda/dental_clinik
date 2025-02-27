import {Outlet} from "react-router-dom";

const MainRouter = () => {

    return (
        <>
            <main>
                <Outlet/>
            </main>
        </>
    )
}

export default MainRouter