import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrash as faTrashSolid} from "@fortawesome/free-solid-svg-icons";

<th
                    key={item.key}
                  >
                    {item.key === "delete" ? (
                      <FontAwesomeIcon
                        icon={faTrashSolid}
                        className="delete-icon"
                      />
                    ) : (
                      <div className={item.key}>{item.label}</div>
                    )}
                  </th>