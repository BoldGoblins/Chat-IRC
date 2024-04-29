import { useSockets } from "../context/socket.context";
import '../index.css';
import styles from "../constant/styles";

function UsersList() {

    const { users, setUsers } = useSockets();

    console.log(users)

    return (
    <div className="flex flex-col gap-4">
        
        <span className={`${styles.titleContainer}`}> <h1 className={`${styles.title2}`}>User list : </h1> </span>

        <div className={`${styles.listItems}`}>

            {Array.isArray(users) && users.map((user) => {
                return (
                    <div className="">
                        <div className={`flex justify-between items-center font-semibold`}>
                            <div className="font-semibold">{user}</div>
                        </div>
                    </div>
                );
            })}
        </div>

    </div>
    );
}

export default UsersList;